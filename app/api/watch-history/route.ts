import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export async function POST(req: Request) {
  try {
    const { userId, movieId, progress, movieName, thumbnail } = await req.json()

    if (!userId || !movieId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const historyRef = doc(db, 'watchHistory', `${userId}_${movieId}`)
    const historyDoc = await getDoc(historyRef)

    if (historyDoc.exists()) {
      const currentData = historyDoc.data()
      // Only update if new progress is higher
      if (progress > currentData.progress) {
        await setDoc(historyRef, {
          userId,
          movieId,
          movieName,
          thumbnail,
          progress,
          watchedAt: new Date().toISOString()
        }, { merge: true })
      }
    } else {
      await setDoc(historyRef, {
        userId,
        movieId,
        movieName,
        thumbnail,
        progress,
        watchedAt: new Date().toISOString()
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Watch history update error:', error)
    return NextResponse.json(
      { error: 'Failed to update watch history' },
      { status: 500 }
    )
  }
} 