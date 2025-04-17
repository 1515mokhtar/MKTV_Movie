import { useState, useEffect } from 'react'
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from './use-auth'
import { useToast } from './use-toast'

interface Comment {
  id: string
  uid: string
  username: string
  userPhoto: string
  content: string
  timestamp: any
  likes: number
  dislikes: number
  userLikes?: string[]
  userDislikes?: string[]
  movieId: string
}

export function useComments(movieId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  const fetchComments = async () => {
    if (!movieId) {
      setLoading(false)
      return
    }

    try {
      console.log('Fetching comments for movieId:', movieId)
      
      // Requête temporaire sans orderBy
      const q = query(
        collection(db, 'comments'),
        where('movieId', '==', movieId)
      )

      const querySnapshot = await getDocs(q)
      console.log('Number of comments found:', querySnapshot.size)
      
      if (querySnapshot.empty) {
        console.log('No comments found for this movie')
        setComments([])
        setLoading(false)
        return
      }

      const commentsData = querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('Processing comment:', data)
        return {
          id: doc.id,
          uid: data.uid || '',
          username: data.username || 'Anonyme',
          userPhoto: data.userPhoto || '',
          content: data.content || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          likes: data.likes || 0,
          dislikes: data.dislikes || 0,
          userLikes: data.userLikes || [],
          userDislikes: data.userDislikes || [],
          movieId: data.movieId || ''
        } as Comment
      })

      // Trier les commentaires par date après les avoir récupérés
      commentsData.sort((a, b) => b.timestamp - a.timestamp)

      console.log('Processed comments:', commentsData)
      setComments(commentsData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setLoading(false)
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    fetchComments()
  }, [movieId])

  const addComment = async (content: string) => {
    if (!user || !movieId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour commenter",
        variant: "destructive"
      })
      return
    }

    try {
      const newComment = {
        movieId,
        uid: user.uid,
        username: user.displayName || 'Anonyme',
        userPhoto: user.photoURL || '',
        content,
        timestamp: new Date(),
        likes: 0,
        dislikes: 0,
        userLikes: [],
        userDislikes: []
      }

      console.log('Adding new comment:', newComment)
      
      const docRef = await addDoc(collection(db, 'comments'), newComment)
      console.log('Comment added with ID:', docRef.id)
      
      await fetchComments()

      toast({
        title: "Succès",
        description: "Votre commentaire a été ajouté"
      })
    } catch (error) {
      console.error('Error adding comment:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du commentaire",
        variant: "destructive"
      })
    }
  }

  const likeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour liker",
        variant: "destructive"
      })
      return
    }

    try {
      const commentRef = doc(db, 'comments', commentId)
      const commentDoc = await getDoc(commentRef)
      
      if (!commentDoc.exists()) {
        toast({
          title: "Erreur",
          description: "Commentaire non trouvé",
          variant: "destructive"
        })
        return
      }

      const comment = commentDoc.data() as Comment

      if (comment.movieId !== movieId) {
        toast({
          title: "Erreur",
          description: "Commentaire non trouvé",
          variant: "destructive"
        })
        return
      }

      if (comment.userLikes?.includes(user.uid)) {
        toast({
          title: "Erreur",
          description: "Vous avez déjà liké ce commentaire",
          variant: "destructive"
        })
        return
      }

      await updateDoc(commentRef, {
        likes: (comment.likes || 0) + 1,
        userLikes: [...(comment.userLikes || []), user.uid]
      })

      await fetchComments()

      toast({
        title: "Succès",
        description: "Vous avez liké ce commentaire"
      })
    } catch (error) {
      console.error('Error liking comment:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du like",
        variant: "destructive"
      })
    }
  }

  const dislikeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour disliker",
        variant: "destructive"
      })
      return
    }

    try {
      const commentRef = doc(db, 'comments', commentId)
      const commentDoc = await getDoc(commentRef)
      
      if (!commentDoc.exists()) {
        toast({
          title: "Erreur",
          description: "Commentaire non trouvé",
          variant: "destructive"
        })
        return
      }

      const comment = commentDoc.data() as Comment

      if (comment.movieId !== movieId) {
        toast({
          title: "Erreur",
          description: "Commentaire non trouvé",
          variant: "destructive"
        })
        return
      }

      if (comment.userDislikes?.includes(user.uid)) {
        toast({
          title: "Erreur",
          description: "Vous avez déjà disliké ce commentaire",
          variant: "destructive"
        })
        return
      }

      await updateDoc(commentRef, {
        dislikes: (comment.dislikes || 0) + 1,
        userDislikes: [...(comment.userDislikes || []), user.uid]
      })

      await fetchComments()

      toast({
        title: "Succès",
        description: "Vous avez disliké ce commentaire"
      })
    } catch (error) {
      console.error('Error disliking comment:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du dislike",
        variant: "destructive"
      })
    }
  }

  return { comments, loading, addComment, likeComment, dislikeComment }
} 