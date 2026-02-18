"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Material } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  Trash2,
  Package,
  Image as ImageIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MaterialDialog } from "@/components/materials/MaterialDialog";
import { toast } from "sonner";

export default function MaterialsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const materials = useLiveQuery(
    () => db.materials
      .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   m.category.toLowerCase().includes(searchTerm.toLowerCase()))
      .toArray(),
    [searchTerm]
  );

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este material?")) {
      try {
        await db.materials.delete(id);
        toast.success("Material eliminado");
      } catch (error) {
        toast.error("Error al eliminar material");
      }
    }
  };

  const handleEdit = (material: Material) => {
    setSelectedMaterial(material);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setSelectedMaterial(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Materiales</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Administra tu inventario de materiales y herramientas.
          </p>
        </div>
        <Button onClick={openNewDialog} className="rounded-xl bg-blue-600 hover:bg-blue-700 w-fit">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Material
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm bg-white dark:bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <Search className="h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Buscar materiales..."
          className="border-none shadow-none focus-visible:ring-0 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Unidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Rendimiento</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {materials?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                  No se encontraron materiales.
                </TableCell>
              </TableRow>
            ) : (
              materials?.map((material) => (
                <TableRow key={material.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800">
                  <TableCell>
                    <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {material.image ? (
                        <img src={material.image} alt={material.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {material.category}
                    </span>
                  </TableCell>
                  <TableCell className="capitalize">{material.unit}</TableCell>
                  <TableCell>${material.price.toLocaleString()}</TableCell>
                  <TableCell>{material.yield ? `${material.yield} m²` : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(material)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        {material.link && (
                          <DropdownMenuItem asChild>
                            <a href={material.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" /> Ver enlace
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => material.id && handleDelete(material.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <MaterialDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        material={selectedMaterial}
      />
    </div>
  );
}
