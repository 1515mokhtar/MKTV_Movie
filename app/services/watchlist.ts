// services/watchlist.ts
import { db } from "@/lib/firebase"
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore"

export const watchlistService = {
  async checkInWatchlist(uid: string, movieId: string) {
    const docRef = doc(db, "watchlist", `${uid}_${movieId}`)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  },

  async addToWatchlist(uid: string, movie: any) {
    await setDoc(doc(db, "watchlist", `${uid}_${movie.id}`), {
      userId: uid,
      movieId: movie.id,
      title: movie.title,
      posterPath: movie.poster_path,
      addedAt: new Date(),
    })
  },

  async removeFromWatchlist(uid: string, movieId: string) {
    await deleteDoc(doc(db, "watchlist", `${uid}_${movieId}`))
  }
}