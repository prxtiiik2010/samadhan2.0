import { db } from "@/lib/firebase";
import { addDoc, collection, doc, getDoc, getDocs, increment, query, updateDoc, where, deleteDoc } from "firebase/firestore";

export interface Complaint {
  id?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  createdAt: number;
  status: "open" | "in_progress" | "resolved" | "submitted";
  upvotes?: number;
  upvotedBy?: string[]; // Array of user IDs who upvoted
  assignedDepartment?: string;
  userId?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  // Auto-added estimation fields
  estimatedYearsMin?: number;
  estimatedYearsMax?: number;
  estimatedResolutionFrom?: number; // timestamp (ms)
  estimatedResolutionTo?: number;   // timestamp (ms)
}

const complaintsCol = collection(db, "complaints");

function getEstimatedYearsForCategory(category: string | undefined): { min: number; max: number } | null {
  if (!category) return null;
  const normalize = (s: string) => s
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/\s*&\s*/g, " & ")
    .replace(/\s+/g, " ")
    .trim();
  const key = normalize(category);
  const map: Record<string, { min: number; max: number }> = {
    "healthcare": { min: 5, max: 10 },
    "education": { min: 5, max: 15 },
    "infrastructure": { min: 3, max: 10 },
    "law & order": { min: 3, max: 7 },
    "corruption": { min: 10, max: 20 },
    "digital services": { min: 2, max: 5 },
    "employment": { min: 5, max: 15 },
    "welfare schemes": { min: 2, max: 5 },
  };
  return map[key] || null;
}

export async function createComplaint(data: Omit<Complaint, "id">) {
  const now = Date.now();
  const est = getEstimatedYearsForCategory(data.category);

  const base: any = {
    upvotes: 0,
    upvotedBy: [],
    ...data,
    createdAt: data.createdAt || now,
  };

  if (est) {
    base.estimatedYearsMin = est.min;
    base.estimatedYearsMax = est.max;
    base.estimatedResolutionFrom = new Date(now).setFullYear(new Date(now).getFullYear() + est.min);
    base.estimatedResolutionTo = new Date(now).setFullYear(new Date(now).getFullYear() + est.max);
  }

  const docRef = await addDoc(complaintsCol, base);
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

export async function upvoteComplaint(id: string, userId: string) {
  try {
    const complaint = await getComplaint(id);
    if (!complaint) throw new Error("Complaint not found");
    
    const upvotedBy = complaint.upvotedBy || [];
    if (upvotedBy.includes(userId)) {
      throw new Error("You have already upvoted this complaint");
    }
    
    await updateDoc(doc(db, "complaints", id), { 
      upvotes: increment(1),
      upvotedBy: [...upvotedBy, userId],
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error("Error upvoting complaint:", error);
    throw error;
  }
}

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}

export async function findNearbyComplaints(lat: number, lng: number, category: string, radiusMeters: number = 100): Promise<Complaint[]> {
  try {
    const allComplaints = await listAllComplaints();
    const nearbyComplaints = allComplaints.filter(complaint => {
      if (complaint.category !== category || !complaint.location?.lat || !complaint.location?.lng) {
        return false;
      }
      const distance = calculateDistance(lat, lng, complaint.location.lat, complaint.location.lng);
      return distance <= radiusMeters;
    });
    return nearbyComplaints;
  } catch (error) {
    console.error("Error finding nearby complaints:", error);
    return [];
  }
}

export async function allocateComplaintToDepartment(id: string, department: string) {
  await updateDoc(doc(db, "complaints", id), { assignedDepartment: department, status: "in_progress" });
}

export async function deleteComplaint(id: string) {
  await deleteDoc(doc(db, "complaints", id));
}


