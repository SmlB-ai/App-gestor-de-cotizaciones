"use client";

import {
  Package,
  Users,
  FileText,
  TrendingUp,
  PlusCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export default function Dashboard() {
  const materialsCount = useLiveQuery(() => db.materials.count());
  const clientsCount = useLiveQuery(() => db.clients.count());
  const jobsCount = useLiveQuery(() => db.jobs.count());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Bienvenido, Gestor</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
          Gestiona tus materiales, clientes y genera cotizaciones profesionales en segundos.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Materiales</CardTitle>
            <Package className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialsCount ?? 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Total en base de datos</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Clientes</CardTitle>
            <Users className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsCount ?? 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Contactos registrados</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Cotizaciones</CardTitle>
            <FileText className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobsCount ?? 0}</div>
            <p className="text-xs text-zinc-500 mt-1">Historial total</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-none shadow-sm bg-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Rendimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-blue-100 mt-1">Eficiencia operativa</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Comienza una nueva tarea de inmediato.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/jobs/new">
              <Button className="w-full justify-start h-12 rounded-xl text-md" variant="outline">
                <PlusCircle className="mr-2 h-5 w-5 text-blue-600" />
                Nueva Cotización / Cálculo
                <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
              </Button>
            </Link>
            <Link href="/materials">
              <Button className="w-full justify-start h-12 rounded-xl text-md" variant="outline">
                <Package className="mr-2 h-5 w-5 text-zinc-600" />
                Agregar Material a Base de Datos
                <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
              </Button>
            </Link>
            <Link href="/clients">
              <Button className="w-full justify-start h-12 rounded-xl text-md" variant="outline">
                <Users className="mr-2 h-5 w-5 text-zinc-600" />
                Registrar Nuevo Cliente
                <ArrowRight className="ml-auto h-4 w-4 text-zinc-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="col-span-3 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold">Consejo del día</h3>
            <p className="text-sm text-zinc-500 mt-2">
              Recuerda configurar tus datos fiscales en la sección de Configuración para que aparezcan automáticamente en tus PDFs.
            </p>
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-800 h-full p-6">
             <div className="flex items-center gap-2 text-zinc-500 text-sm italic">
                "La calidad es mejor que la cantidad. Un home run es mejor que dos dobles." - Steve Jobs
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
