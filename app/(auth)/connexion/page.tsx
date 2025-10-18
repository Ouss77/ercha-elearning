import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthPageWrapper } from "@/components/auth/auth-page-wrapper";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <AuthPageWrapper>
      <Card className="w-full max-w-md border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl relative z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo iconSize="xl" showText={false} />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Connexion
          </CardTitle>
          <CardDescription className="text-base">
            Accédez à votre espace d'apprentissage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </AuthPageWrapper>
  );
}
