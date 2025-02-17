
'use client'
import { signInWithPopup, GoogleAuthProvider, getAuth } from "firebase/auth";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const db = getFirestore();
  const auth = getAuth();

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      // Connexion avec Google (en utilisant signInWithPopup)
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Référence du document utilisateur
      const userRef = doc(db, "users", user.uid);

      // Vérifiez si le document de l'utilisateur existe, sinon créez-le
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        // Créez un nouveau document si l'utilisateur n'existe pas
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          eta: "connected", // Initialiser l'état à "connected"
        });
      } else {
        // Mettre à jour l'état de l'utilisateur s'il existe déjà
        await updateDoc(userRef, { eta: "connected" });
      }

      // Ajouter l'historique de la connexion
      const historiqueRef = collection(userRef, "historique");
      await addDoc(historiqueRef, {
        date: serverTimestamp(),
        etat: "connexion",
      });

      // Rediriger vers la page d'accueil
      router.push("/");
    } catch (error) {
      console.error("Erreur lors de la connexion avec Google", error);
    }
  };

  return (
    <div className="container mx-auto px-4 h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isResetMode ? "Réinitialiser le mot de passe" : "Login"}
          </CardTitle>
          <CardDescription className="text-center">
            {isResetMode 
              ? "Entrez votre email pour recevoir un lien de réinitialisation" 
              : "Entrez vos identifiants pour accéder à votre compte"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isResetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Envoyer le lien</Button>
            </form>
          ) : (
            <form  className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <div className="text-right text-sm">
                  <button 
                    type="button" 
                    className="text-indigo-600 hover:text-indigo-500"
                    onClick={() => setIsResetMode(true)}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full">Se connecter</Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          {!isResetMode && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span>
                </div>
              </div>
              <Button onClick={loginWithGoogle} variant="outline" className="w-full">
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                Google
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
