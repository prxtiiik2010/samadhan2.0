import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, getDocs, increment, query, updateDoc, where } from "firebase/firestore";

export interface Complaint {
  id?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  createdAt: number;
  status: "open" | "in_progress" | "resolved";
  upvotes?: number;
  userId?: string;
}

const complaintsCol = collection(db, "complaints");

export async function createComplaint(data: Omit<Complaint, "id">) {
  const docRef = await addDoc(complaintsCol, { upvotes: 0, ...data });
  return docRef.id;
}

export async function getComplaint(id: string) {
  const snap = await getDoc(doc(db, "complaints", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Complaint) : null;
}

export async function listComplaintsByUser(userId: string) {
  const q = query(complaintsCol, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint));
}

export async function updateComplaintStatus(id: string, status: Complaint["status"]) {
  await updateDoc(doc(db, "complaints", id), { status });
}

export async function listAllComplaints() {
  const snap = await getDocs(complaintsCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Complaint));
}

export async function upvoteComplaint(id: string) {
  await updateDoc(doc(db, "complaints", id), { upvotes: increment(1) });
}


