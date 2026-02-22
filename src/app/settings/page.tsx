"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db, type Settings } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Building2, Mail, Phone, MapPin, CreditCard, ImageIcon, Save, X, Upload } from "lucide-react";
import { fileToBase64 } from "@/lib/file-utils";

const formSchema = z.object({
  companyName: z.string().min(2, "Mínimo 2 caracteres"),
  taxId: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  email: z.string().email("Correo inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export default function SettingsPage() {
  const currentSettings = useLiveQuery(() => db.settings.get(1));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      taxId: "",
      address: "",
      logo: "",
      email: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (currentSettings) {
      form.reset(currentSettings);
    }
  }, [currentSettings, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await db.settings.put({ id: 1, ...values });
      toast.success("Configuración guardada correctamente");
    } catch (error) {
      toast.error("Error al guardar la configuración");
      console.error(error);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Personaliza los datos de tu empresa que aparecerán en los PDFs.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <CardTitle className="text-lg">Perfil de Empresa</CardTitle>
              <CardDescription>Estos datos se usarán como emisor en tus cotizaciones.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa / Tu Nombre</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input placeholder="Ej. Constructora Pro S.A." className="pl-9 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RFC / Tax ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                          <Input placeholder="ID Fiscal" className="pl-9 rounded-xl" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                          <Input placeholder="55 1234 5678" className="pl-9 rounded-xl" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo de Contacto</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input placeholder="contacto@tuempresa.com" className="pl-9 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección Fiscal</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input placeholder="Calle, Ciudad, CP" className="pl-9 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Logo de la Empresa</FormLabel>
                <div className="flex items-center gap-6">
                  <div className="w-32 h-32 rounded-3xl bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden relative group transition-all">
                    {form.watch("logo") ? (
                      <>
                        <img src={form.watch("logo")} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                        <button
                          type="button"
                          onClick={() => form.setValue("logo", "")}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-6 h-6 text-white" />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-8 h-8 text-zinc-300" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="cursor-pointer">
                      <div className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all">
                        <Upload className="w-4 h-4 mr-2" />
                        Seleccionar Archivo
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await fileToBase64(file);
                              form.setValue("logo", base64);
                            } catch (err) {
                              toast.error("Error al procesar la imagen");
                            }
                          }
                        }}
                      />
                    </label>
                    <p className="text-xs text-zinc-500">Se recomienda formato PNG transparente y tamaño cuadrado.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 h-11 px-8">
              <Save className="mr-2 h-4 w-4" /> Guardar Configuración
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
