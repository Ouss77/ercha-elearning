"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

export function ContactContent() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: Implement actual form submission logic
    alert(
      "Merci pour votre message ! Nous vous répondrons dans les plus brefs délais."
    );
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Contactez-
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
              Nous
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Une question ? Une suggestion ? Notre équipe est à votre écoute pour
            vous aider dans votre parcours d'apprentissage.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="md:col-span-3">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Envoyez-nous un Message
                </CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons
                  rapidement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom Complet *</Label>
                      <Input
                        id="name"
                        placeholder="Votre nom"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Sujet *</Label>
                    <Input
                      id="subject"
                      placeholder="De quoi souhaitez-vous parler ?"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Écrivez votre message ici..."
                      rows={6}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 dark:from-teal-500 dark:to-emerald-500"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900">
                    <Mail className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Email
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      contact@eduplatform.ma
                    </p>
                    <p className="text-sm text-muted-foreground">
                      support@eduplatform.ma
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                    <Phone className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Téléphone
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      +212 XX XX XX XX XX
                    </p>
                    <p className="text-sm text-muted-foreground">
                      +212 XX XX XX XX XX
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-lg bg-cyan-100 dark:bg-cyan-900">
                    <MapPin className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Adresse
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Hay Moulay Rachid, Casablanca
                    </p>
                    <p className="text-sm text-muted-foreground">Maroc 20500</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-teal-100 dark:bg-teal-900">
                    <Clock className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Horaires
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Lun - Ven: 09:00 - 17:00
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sam: 09:00 - 13:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-950/20 dark:to-emerald-950/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Besoin d'un Compte ?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Les comptes sont créés uniquement par notre équipe
                  administrative. Contactez-nous pour plus d'informations sur
                  nos programmes de formation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  Réseaux Sociaux
                </h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900 hover:bg-teal-200 dark:hover:bg-teal-800 transition-colors"
                  >
                    <svg
                      className="h-5 w-5 text-teal-600 dark:text-teal-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
                  >
                    <svg
                      className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900 hover:bg-cyan-200 dark:hover:bg-cyan-800 transition-colors"
                  >
                    <svg
                      className="h-5 w-5 text-cyan-600 dark:text-cyan-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
