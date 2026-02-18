"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Job } from "@/lib/db";
import { formatCurrency } from "@/lib/calc-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreHorizontal,
  FileText,
  Download,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { JobPDF } from "@/components/pdf/JobPDF";
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
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function PDFLinkWrapper({ job }: { job: Job }) {
  const [data, setData] = useState<{ client: any, settings: any } | null>(null);

  const loadData = async () => {
    const client = await db.clients.get(job.clientId);
    const settingsList = await db.settings.toArray();
    const settings = settingsList[0] || {
      id: 1,
      companyName: "Mi Empresa",
      taxId: "",
      address: "",
      logo: "",
      email: "",
      phone: ""
    };
    setData({ client, settings });
  };

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        if (!data) loadData();
      }}
    >
      {data ? (
        <PDFDownloadLink
          document={<JobPDF job={job} client={data.client} settings={data.settings} />}
          fileName={`${job.type === 'quotation' ? 'Cotizacion' : 'Factura'}_${job.id}.pdf`}
          className="flex items-center w-full"
        >
          {({ loading }) => (
            <div className="flex items-center">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              {loading ? 'Generando...' : 'Descargar PDF'}
            </div>
          )}
        </PDFDownloadLink>
      ) : (
        <div className="flex items-center w-full cursor-pointer" onClick={loadData}>
          <Download className="mr-2 h-4 w-4" /> Preparar PDF
        </div>
      )}
    </DropdownMenuItem>
  );
}

export default function JobsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const jobs = useLiveQuery(
    async () => {
      const allJobs = await db.jobs.toArray();
      const clients = await db.clients.toArray();

      return allJobs
        .map(job => ({
          ...job,
          clientName: clients.find(c => c.id === job.clientId)?.name || "Cliente desconocido"
        }))
        .filter(j =>
          j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.clientName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    },
    [searchTerm]
  );

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta cotización?")) {
      try {
        await db.jobs.delete(id);
        toast.success("Eliminado correctamente");
      } catch (error) {
        toast.error("Error al eliminar");
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'sent': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'sent': return 'Enviado';
      default: return 'Borrador';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trabajos & Cotizaciones</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Historial de cálculos, cotizaciones y facturas generadas.
          </p>
        </div>
        <Link href="/jobs/new">
          <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 w-fit">
            <Plus className="mr-2 h-4 w-4" /> Nueva Cotización
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm bg-white dark:bg-zinc-900 px-3 py-1 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <Search className="h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Buscar por título o cliente..."
          className="border-none shadow-none focus-visible:ring-0 bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-zinc-100 dark:border-zinc-800">
              <TableHead>Fecha</TableHead>
              <TableHead>Título / Proyecto</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-zinc-500">
                  No se encontraron registros.
                </TableCell>
              </TableRow>
            ) : (
              jobs?.map((job) => (
                <TableRow key={job.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800">
                  <TableCell className="text-sm text-zinc-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(job.date, "dd MMM, yyyy", { locale: es })}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-sm">{(job as any).clientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                      {job.type === 'quotation' ? 'Cotización' : 'Factura'}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold text-blue-600">
                    {formatCurrency(job.total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      {getStatusIcon(job.status)}
                      {getStatusText(job.status)}
                    </div>
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
                        <PDFLinkWrapper job={job} />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => job.id && handleDelete(job.id)}
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
    </div>
  );
}
