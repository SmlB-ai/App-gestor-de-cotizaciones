"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Client } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Mail,
  Phone,
  MapPin
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
import { ClientDialog } from "@/components/clients/ClientDialog";
import { toast } from "sonner";

export default function ClientsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const clients = useLiveQuery(
    () => db.clients
      .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   c.email.toLowerCase().includes(searchTerm.toLowerCase()))
      .toArray(),
    [searchTerm]
  );

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await db.clients.delete(id);
        toast.success("Cliente eliminado");
      } catch (error) {
        toast.error("Error al eliminar cliente");
      }
    }
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setSelectedClient(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Gestiona tu base de datos de clientes para facturación y cotizaciones.
          </p>
        </div>
        <Button onClick={openNewDialog} className="rounded-xl bg-blue-600 hover:bg-blue-700 w-fit">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm bg-white dark:bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Search className="h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Buscar clientes..."
          className="border-none shadow-none focus-visible:ring-0 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
              <TableHead>Nombre / Empresa</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Identificación Fiscal</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                  No se encontraron clientes.
                </TableCell>
              </TableRow>
            ) : (
              clients?.map((client) => (
                <TableRow key={client.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {client.email && (
                        <div className="flex items-center text-xs text-zinc-500">
                          <Mail className="mr-1.5 h-3 w-3" /> {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center text-xs text-zinc-500">
                          <Phone className="mr-1.5 h-3 w-3" /> {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400 font-mono">
                      {client.taxId || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {client.address ? (
                      <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400 max-w-[200px] truncate">
                        <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0 text-zinc-400" /> {client.address}
                      </div>
                    ) : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => client.id && handleDelete(client.id)}
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

      <ClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={selectedClient}
      />
    </div>
  );
}
