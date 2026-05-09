import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  user_id: string | null;
  created_at: string;
  is_read: boolean;
}

export type ContactMessageInsert = Omit<ContactMessage, 'id' | 'created_at' | 'is_read'>;

const COLLECTION_NAME = 'contact_messages';

const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  return new Error('Unknown error');
};

const toIsoDateString = (value: unknown): string => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date().toISOString();
};

export const contactService = {
  async getAllMessages(): Promise<{ data: ContactMessage[] | null; error: Error | null }> {
    try {
      const messageQuery = query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(messageQuery);

      const messages: ContactMessage[] = querySnapshot.docs.map((messageDoc) => {
        const data = messageDoc.data();

        return {
          id: messageDoc.id,
          name: String(data.name ?? ''),
          email: String(data.email ?? ''),
          subject: String(data.subject ?? ''),
          message: String(data.message ?? ''),
          user_id: typeof data.user_id === 'string' ? data.user_id : null,
          created_at: toIsoDateString(data.created_at),
          is_read: Boolean(data.is_read),
        };
      });

      return { data: messages, error: null };
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  },

  async insertMessage(message: ContactMessageInsert): Promise<{ data: ContactMessage | null; error: Error | null }> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...message,
        created_at: serverTimestamp(),
        is_read: false,
      });

      const newMessage: ContactMessage = {
        ...message,
        id: docRef.id,
        created_at: new Date().toISOString(),
        is_read: false,
      };

      return { data: newMessage, error: null };
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  },

  async markAsRead(id: string): Promise<{ data: ContactMessage | null; error: Error | null }> {
    try {
      const messageRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(messageRef, { is_read: true });

      const updatedMessage: ContactMessage = {
        id,
        name: '',
        email: '',
        subject: '',
        message: '',
        user_id: null,
        created_at: new Date().toISOString(),
        is_read: true,
      };

      return { data: updatedMessage, error: null };
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  },

  async deleteMessage(id: string): Promise<{ error: Error | null }> {
    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return { error: null };
    } catch (error) {
      return { error: toError(error) };
    }
  },
};
