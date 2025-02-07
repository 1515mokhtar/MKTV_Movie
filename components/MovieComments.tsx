"use client"

import { useState } from "react"

interface MovieCommentsProps {
  movieId: string
}

export function MovieComments({ movieId }: MovieCommentsProps) {
  const [comments, setComments] = useState<string[]>([])
  const [newComment, setNewComment] = useState("")

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment])
      setNewComment("")
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Comments</h2>
      <div className="space-y-4">
        {comments.map((comment, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <p>{comment}</p>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded-lg"
          placeholder="Add a comment..."
        />
        <button
          onClick={handleAddComment}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
    </div>
  )
}