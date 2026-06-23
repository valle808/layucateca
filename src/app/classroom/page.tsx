import { Metadata } from "next";
import ClassroomClient from './ClassroomClient';

export const metadata: Metadata = {
  title: "Aulas Interactivas",
  description: "Accede a cursos y aulas interactivas premium de La Yucateca.",
};

export const dynamic = 'force-dynamic';

export default function Page() {
  return <ClassroomClient />;
}
