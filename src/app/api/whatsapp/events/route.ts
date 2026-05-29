/**
 * Server-Sent Events (SSE) route for real-time WhatsApp status updates.
 * The frontend connects once and receives all state changes pushed from the server.
 */
import { getWaManager, waEvents } from "@/lib/whatsapp-manager";

export const dynamic = "force-dynamic";

export async function GET() {
  // Ensure manager is initialized (creates global if needed)
  getWaManager();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send current state immediately on connect
      const send = (event: string, data: unknown) => {
        try {
          const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (_) {
          // Client disconnected
        }
      };

      // Send initial state
      const manager = getWaManager();
      send("state", manager.getState());

      // Subscribe to state changes
      const onState = (data: unknown) => send("state", data);
      const onContacts = (data: unknown) => send("contacts", data);
      const onGroups = (data: unknown) => send("groups", data);
      const onConnected = (data: unknown) => send("connected", data);

      waEvents.on("state", onState);
      waEvents.on("contacts.update", onContacts);
      waEvents.on("groups.update", onGroups);
      waEvents.on("connected", onConnected);

      // Heartbeat every 20s to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch (_) {
          clearInterval(heartbeat);
        }
      }, 20000);

      // Cleanup on stream close
      return () => {
        clearInterval(heartbeat);
        waEvents.off("state", onState);
        waEvents.off("contacts.update", onContacts);
        waEvents.off("groups.update", onGroups);
        waEvents.off("connected", onConnected);
      };
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
