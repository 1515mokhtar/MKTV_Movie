"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, updateProfile, updateEmail, updatePhoneNumber } from "firebase/auth"
import { doc, setDoc, getDoc ,updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase" // Import auth and Firestore from your Firebase config
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, LogOut, Edit } from "lucide-react"
import { toast } from "sonner" // For toast notifications
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PhoneConfirmation } from "@/components/phone-confirmation" // Custom component for phone confirmation

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [birthday, setBirthday] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneConfirmationOpen, setPhoneConfirmationOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await createUserIfNotExists(firebaseUser) // Create user in Firestore if they don't exist
      } else {
        router.push("/") // Redirect to home page if not authenticated
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const createUserIfNotExists = async (user: User) => {
    const userRef = doc(db, "users", user.uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        birthday: "",
        phoneNumber: "",
        phoneVerified: false,
      })
    }
  }

  const handleSignOut = async () => {
    try {
      // Mise à jour de l'état de l'utilisateur dans Firestore avant la déconnexion
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { eta: "disconnected" });
  
        // Déconnexion de l'utilisateur
        await auth.signOut();
        router.push("/"); // Redirection vers la page d'accueil
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion", error);
    }
  }

  const handleEditProfile = async () => {
    if (!user) return

    try {
      await updateProfile(user, { displayName: fullName })
      await updateEmail(user, email)
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: fullName,
          email,
          birthday,
          phoneNumber,
        },
        { merge: true }
      )
      toast.success("Profile updated successfully!")
      setEditOpen(false)
    } catch (error) {
      toast.error("Failed to update profile. Please try again.")
    }
  }

  const handlePhoneConfirmation = () => {
    setPhoneConfirmationOpen(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card>
          <CardHeader className="flex flex-col items-center gap-4">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-8 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card className="w-full">
        <CardHeader className="flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
            <AvatarFallback>
              {user.displayName
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <CardTitle className="text-2xl">{user.displayName}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Mail className="text-muted-foreground" />
            <span>{user.email}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label>Birthday</Label>
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={handlePhoneConfirmation}
                  >
                    Confirm Phone Number
                  </Button>
                </div>
                <Button onClick={handleEditProfile}>Save Changes</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardFooter>
      </Card>

      {/* Phone Confirmation Popup */}
      <PhoneConfirmation
        open={phoneConfirmationOpen}
        onOpenChange={setPhoneConfirmationOpen}
        phoneNumber={phoneNumber}
        onSuccess={() => {
          toast.success("Phone number confirmed successfully!")
          setPhoneConfirmationOpen(false)
        }}
      />
    </div>
  )
}