import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-accent/10 to-primary/5 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-chart-2/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-chart-2 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Inscription
          </CardTitle>
          <CardDescription className="text-base">Créez votre compte pour commencer</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
