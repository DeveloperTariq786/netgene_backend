import axios from "axios";
import FormData from "form-data";

export async function uploadToFirebaseStorage(buffer, fileName, mimeType) {
  const apiKey = process.env.FIREBASE_API_KEY;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET; 
  // example: your-app.appspot.com

  const url = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o?name=${encodeURIComponent(fileName)}&uploadType=media&key=${apiKey}`;

  const headers = {
    "Content-Type": mimeType,
  };

  const response = await axios.post(url, buffer, { headers });

  // public URL:
  const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(fileName)}?alt=media`;

  return downloadUrl;
}
