"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db, type Material } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Package, Link as LinkIcon, DollarSign, Ruler, ImageIcon, X, Upload } from "lucide-react";
import { fileToBase64 } from "@/lib/file-utils";

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
  price: z.any().transform(v => Number(v)),
  link: z.string().optional().or(z.literal("")),
  image: z.string().optional(),
  unit: z.string().min(1, "Selecciona una unidad"),
  yield: z.any().transform(v => Number(v)),
});

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  material?: Material | null;
}

export function MaterialDialog({ open, onOpenChange, material }: MaterialDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "General",
      price: 0,
      link: "",
      image: "",
      unit: "unidad",
      yield: 0,
    },
  });

  useEffect(() => {
    if (material) {
      form.reset({
        name: material.name,
        category: material.category,
        price: material.price,
        link: material.link || "",
        image: material.image || "",
        unit: material.unit,
        yield: material.yield || 0,
      });
    } else {
      form.reset({
        name: "",
        category: "General",
        price: 0,
        link: "",
        image: "",
        unit: "unidad",
        yield: 0,
      });
    }
  }, [material, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (material?.id) {
        await db.materials.update(material.id, values);
        toast.success("Material actualizado correctamente");
      } else {
        await db.materials.add(values as Material);
        toast.success("Material agregado correctamente");
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error("Error al guardar el material");
      console.error(error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            {material ? "Editar Material" : "Nuevo Material"}
          </DialogTitle>
          <DialogDescription>
            Ingresa los detalles del material para tu base de datos.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Cubeta de Impermeabilizante" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Pintura">Pintura</SelectItem>
                        <SelectItem value="Impermeabilización">Impermeabilización</SelectItem>
                        <SelectItem value="Herramientas">Herramientas</SelectItem>
                        <SelectItem value="Eléctrico">Eléctrico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Unidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unidad">Unidad</SelectItem>
                        <SelectItem value="litro">Litro</SelectItem>
                        <SelectItem value="cubeta">Cubeta</SelectItem>
                        <SelectItem value="metro">Metro</SelectItem>
                        <SelectItem value="m2">M2</SelectItem>
                        <SelectItem value="kg">KG</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input type="number" step="0.01" className="pl-9 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="yield"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rendimiento (m²)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                        <Input type="number" step="0.1" className="pl-9 rounded-xl" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>Por unidad</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (URL)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                      <Input placeholder="https://..." className="pl-9 rounded-xl" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Imagen del Material</FormLabel>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex items-center justify-center overflow-hidden relative group">
                  {form.watch("image") ? (
                    <>
                      <img src={form.watch("image")} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => form.setValue("image", "")}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <X className="w-5 h-5 text-white" />
                      </button>
                    </>
                  ) : (
                    <ImageIcon className="w-6 h-6 text-zinc-300" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                      <Upload className="w-4 h-4" />
                      Subir imagen local
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const base64 = await fileToBase64(file);
                          form.setValue("image", base64);
                        }
                      }}
                    />
                  </label>
                  <p className="text-[10px] text-zinc-500 mt-1">PNG, JPG o WEBP. Máx 2MB recomendado.</p>
                </div>
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700">
                {material ? "Guardar Cambios" : "Agregar Material"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
