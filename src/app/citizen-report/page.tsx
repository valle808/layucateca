import CitizenReportClient from "./CitizenReportClient";

export const dynamic = "force-dynamic";


export const metadata = {
  title: "Reporte Ciudadano",
  description: "Canal interactivo de denuncias comunitarias.",
};

export default function CitizenReportPage() {
  return <CitizenReportClient />;
}
