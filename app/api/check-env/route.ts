import { NextResponse } from "next/server"

export async function GET() {
  const hasPublicKey = !!process.env.NEXT_PUBLIC_TMDB_API_KEY
  const hasPrivateKey = !!process.env.TMDB_API_KEY

  return NextResponse.json({
    publicKey: hasPublicKey ? "Configured" : "Missing",
    privateKey: hasPrivateKey ? "Configured" : "Missing",
  })
}

