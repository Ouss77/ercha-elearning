import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper"
import { GraduationCap } from "lucide-react"

export default function LoginPage() {
  return (
    <AuthPageWrapper>
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-chart-2 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Connexion
          </CardTitle>
          <CardDescription className="text-base">Accédez à votre espace d'apprentissage</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </AuthPageWrapper>
  )
}
