"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Job, type JobItem, type Material } from "@/lib/db";
import { calculateRequiredUnits, calculateJobTotals, formatCurrency } from "@/lib/calc-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Calculator,
  Save,
  ArrowLeft,
  ChevronRight,
  User,
  Package,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function NewJobPage() {
  const router = useRouter();

  // State
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState<'quotation' | 'invoice'>('quotation');
  const [items, setItems] = useState<JobItem[]>([]);
  const [ivaEnabled, setIvaEnabled] = useState(true);
  const [ivaPercent, setIvaPercent] = useState(16);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(0);

  // DB Data
  const clients = useLiveQuery(() => db.clients.toArray());
  const materials = useLiveQuery(() => db.materials.toArray());

  // Calculations
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.subtotal, 0);
  }, [items]);

  const totals = useMemo(() => {
    return calculateJobTotals(subtotal, ivaEnabled, ivaPercent, discountEnabled, discountPercent);
  }, [subtotal, ivaEnabled, ivaPercent, discountEnabled, discountPercent]);

  // Actions
  const addItem = (material: Material, customQty?: number, customName?: string) => {
    if (!material.id) return;

    const qty = customQty ?? 1;
    const newItem: JobItem = {
      materialId: material.id,
      name: customName ?? material.name,
      quantity: qty,
      price: material.price,
      subtotal: qty * material.price,
    };

    setItems([...items, newItem]);
    toast.success(`${newItem.name} agregado`);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const updateItemQuantity = (index: number, qty: number) => {
    const newItems = [...items];
    const item = newItems[index];
    item.quantity = qty;
    item.subtotal = qty * item.price;
    setItems(newItems);
  };

  const handleSave = async () => {
    if (!selectedClientId) {
      toast.error("Por favor selecciona un cliente");
      return;
    }
    if (items.length === 0) {
      toast.error("Agrega al menos un material");
      return;
    }

    try {
      const job: Job = {
        clientId: parseInt(selectedClientId),
        title: title || "Sin título",
        date: new Date(),
        status: 'draft',
        items,
        subtotal: totals.subtotal,
        ivaEnabled,
        ivaPercent,
        discountEnabled,
        discountPercent,
        total: totals.total,
        type: jobType,
      };

      await db.jobs.add(job);
      toast.success("Trabajo guardado correctamente");
      router.push("/jobs");
    } catch (error) {
      toast.error("Error al guardar el trabajo");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nueva Cotización / Trabajo</h1>
        </div>
        <Button onClick={handleSave} className="rounded-xl bg-blue-600 hover:bg-blue-700 h-11 px-6">
          <Save className="mr-2 h-4 w-4" /> Guardar Todo
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Client and Info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                 <User className="w-5 h-5 text-zinc-400" />
                 <CardTitle className="text-lg">Información del Cliente</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Seleccionar Cliente</Label>
                  <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Busca un cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map(client => (
                        <SelectItem key={client.id} value={client.id?.toString() || ""}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Documento</Label>
                  <Select value={jobType} onValueChange={(v: any) => setJobType(v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quotation">Cotización</SelectItem>
                      <SelectItem value="invoice">Factura / Nota de Remisión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Descripción Breve del Trabajo</Label>
                <Input
                  id="title"
                  placeholder="Ej. Impermeabilización de azotea casa sur"
                  className="rounded-xl"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                 <Package className="w-5 h-5 text-zinc-400" />
                 <CardTitle className="text-lg">Materiales y Herramientas</CardTitle>
              </div>
              <AddMaterialDialog onAdd={addItem} materials={materials || []} />
            </CardHeader>
            <CardContent className="p-0">
              {items.length === 0 ? (
                <div className="py-12 text-center text-zinc-500">
                  <Package className="w-12 h-12 text-zinc-100 dark:text-zinc-800 mx-auto mb-3" />
                  <p>No has agregado materiales aún.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 flex items-center justify-between group">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50 truncate">{item.name}</p>
                        <p className="text-sm text-zinc-500">{formatCurrency(item.price)} x unidad</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            className="w-20 rounded-lg text-center h-8"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-sm text-zinc-500">cant.</span>
                        </div>
                        <p className="font-semibold min-w-[100px] text-right">
                          {formatCurrency(item.subtotal)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Totals and Options */}
        <div className="space-y-6">
          <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden sticky top-6">
            <CardHeader className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                 <FileText className="w-5 h-5 text-zinc-400" />
                 <CardTitle className="text-lg">Resumen de Totales</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="discount"
                      checked={discountEnabled}
                      onCheckedChange={(checked) => setDiscountEnabled(!!checked)}
                      className="rounded-md"
                    />
                    <label htmlFor="discount" className="text-sm text-zinc-500">Descuento (%)</label>
                  </div>
                  {discountEnabled && (
                    <Input
                      type="number"
                      className="w-16 h-8 text-right rounded-lg"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                    />
                  )}
                </div>
                {discountEnabled && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Monto Descuento</span>
                    <span>-{formatCurrency(totals.discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="iva"
                      checked={ivaEnabled}
                      onCheckedChange={(checked) => setIvaEnabled(!!checked)}
                      className="rounded-md"
                    />
                    <label htmlFor="iva" className="text-sm text-zinc-500">Aplicar IVA (%)</label>
                  </div>
                  {ivaEnabled && (
                    <Input
                      type="number"
                      className="w-16 h-8 text-right rounded-lg"
                      value={ivaPercent}
                      onChange={(e) => setIvaPercent(parseFloat(e.target.value) || 0)}
                    />
                  )}
                </div>
                {ivaEnabled && (
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">IVA</span>
                    <span>{formatCurrency(totals.ivaAmount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-medium text-zinc-500">Total Final</span>
                  <span className="text-3xl font-bold text-blue-600">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-sm bg-zinc-900 text-white overflow-hidden">
             <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold">Calculadora de Área</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-4">
                  Usa esta herramienta para calcular materiales basados en metros cuadrados y rendimiento.
                </p>
                <AreaCalculatorDialog materials={materials || []} onAdd={addItem} />
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function AddMaterialDialog({ materials, onAdd }: { materials: Material[], onAdd: (m: Material, q?: number, n?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Agregar Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Seleccionar Material</DialogTitle>
          <DialogDescription>
            Busca y selecciona un material de tu base de datos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl"
          />
          <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
            {filtered.map(material => (
              <div
                key={material.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer group"
                onClick={() => {
                  onAdd(material);
                  setOpen(false);
                }}
              >
                <div>
                  <p className="font-medium text-sm">{material.name}</p>
                  <p className="text-xs text-zinc-500">{formatCurrency(material.price)} / {material.unit}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 transition-colors" />
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-zinc-500 py-4">No se encontraron resultados.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AreaCalculatorDialog({ materials, onAdd }: { materials: Material[], onAdd: (m: Material, q?: number, n?: string) => void }) {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [selectedMatId, setSelectedMatId] = useState<string>("");

  const selectedMat = useMemo(() =>
    materials.find(m => m.id?.toString() === selectedMatId),
    [selectedMatId, materials]
  );

  const calculatedUnits = useMemo(() => {
    if (!selectedMat || !selectedMat.yield) return 0;
    return calculateRequiredUnits({ width, length, yieldPerUnit: selectedMat.yield });
  }, [width, length, selectedMat]);

  const handleAddWithCalc = () => {
    if (!selectedMat) return;

    const customName = `${selectedMat.name} (Calculado ${width}x${length}m)`;

    onAdd(selectedMat, calculatedUnits, customName);

    toast.success("Cálculo aplicado");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 border-none shadow-lg">
          Abrir Calculadora
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl bg-white dark:bg-zinc-900 border-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Calculadora de Rendimiento
          </DialogTitle>
          <DialogDescription>
            Calcula automáticamente cuántas unidades necesitas.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ancho (m)</Label>
              <Input type="number" value={width} onChange={e => setWidth(parseFloat(e.target.value) || 0)} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Largo (m)</Label>
              <Input type="number" value={length} onChange={e => setLength(parseFloat(e.target.value) || 0)} className="rounded-xl" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Material</Label>
            <Select value={selectedMatId} onValueChange={setSelectedMatId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecciona un material..." />
              </SelectTrigger>
              <SelectContent>
                {materials.filter(m => !!m.yield).map(m => (
                  <SelectItem key={m.id} value={m.id?.toString() || ""}>
                    {m.name} ({m.yield}m² / {m.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-zinc-500">Solo se muestran materiales con rendimiento configurado.</p>
          </div>

          {selectedMat && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
               <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-500">Área Total:</span>
                  <span className="font-semibold">{width * length} m²</span>
               </div>
               <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-zinc-500">Unidades necesarias:</span>
                  <span className="text-lg font-bold text-blue-600">{calculatedUnits} {selectedMat.unit}(s)</span>
               </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleAddWithCalc} disabled={!selectedMat || calculatedUnits <= 0} className="w-full rounded-xl bg-blue-600 hover:bg-blue-700">
            Añadir al presupuesto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
