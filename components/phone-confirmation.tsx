"use client"

import { useState } from "react"
import { auth } from "@/lib/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function PhoneConfirmation({
  open,
  onOpenChange,
  phoneNumber,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
  onSuccess: () => void
}) {
  const [code, setCode] = useState("")
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSendCode = async () => {
    try {
        const recaptcha = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible", // Use "normal" for a visible reCAPTCHA widget
          });
      const result = await signInWithPhoneNumber(auth, phoneNumber, recaptcha)
      setConfirmationResult(result)
    } catch (err) {
      setError("Failed to send verification code. Please try again.")
    }
  }

  const handleVerifyCode = async () => {
    try {
      await confirmationResult.confirm(code)
      onSuccess()
    } catch (err) {
      setError("Invalid verification code. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Phone Number</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
        <div id="recaptcha-container"></div>
          {!confirmationResult ? (
            <Button onClick={handleSendCode}>Send Verification Code</Button>
          ) : (
            <>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter verification code"
              />
              <Button onClick={handleVerifyCode}>Verify Code</Button>
            </>
          )}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}