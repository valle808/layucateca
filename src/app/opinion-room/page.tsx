import OpinionRoomClient from "./OpinionRoomClient";

export const dynamic = "force-dynamic";


export const metadata = {
  title: "Opiniones y Debate",
  description: "Salas de debate y opinión ciudadana.",
};

export default function OpinionRoomPage() {
  return <OpinionRoomClient />;
}
