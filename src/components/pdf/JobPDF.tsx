"use client";

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { type Job, type Client, type Settings } from '@/lib/db';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Register a nice font if possible, or use standard ones
// Font.register({ family: 'Helvetica', ... });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
    lineHeight: 1.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: 2,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  companyInfo: {
    flexDirection: 'column',
    maxWidth: 250,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  documentTitleContainer: {
    textAlign: 'right',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb', // Blue-600
    textTransform: 'uppercase',
  },
  documentId: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a1a1a',
    borderBottom: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: {
    width: '48%',
  },
  label: {
    fontSize: 8,
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 10,
    color: '#333',
    marginBottom: 8,
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottom: 1,
    borderBottomColor: '#e2e8f0',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: 1,
    borderBottomColor: '#f1f5f9',
    padding: 8,
    alignItems: 'center',
  },
  colDesc: { width: '50%' },
  colQty: { width: '15%', textAlign: 'center' },
  colPrice: { width: '15%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },

  termsContainer: {
    marginTop: 40,
    width: '60%',
  },
  signatureContainer: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureLine: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#333',
    textAlign: 'center',
    paddingTop: 5,
  },

  totalsContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsBox: {
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  finalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 8,
    borderTop: 2,
    borderTopColor: '#2563eb',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#2563eb',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    borderTop: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    fontSize: 8,
    color: '#999',
  }
});

interface JobPDFProps {
  job: Job;
  client: Client;
  settings: Settings;
}

export const JobPDF = ({ job, client, settings }: JobPDFProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  const totals = {
    subtotal: job.items.reduce((sum, i) => sum + i.subtotal, 0),
    discount: job.discountEnabled ? job.subtotal * (job.discountPercent / 100) : 0,
    iva: job.ivaEnabled ? (job.subtotal - (job.discountEnabled ? job.subtotal * (job.discountPercent / 100) : 0)) * (job.ivaPercent / 100) : 0,
    total: job.total
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {settings.logo && <Image src={settings.logo} style={styles.logo} />}
            <Text style={styles.companyName}>{settings.companyName || 'Tu Empresa'}</Text>
            <Text style={styles.value}>{settings.taxId}</Text>
            <Text style={styles.value}>{settings.address}</Text>
            <Text style={styles.value}>{settings.phone} | {settings.email}</Text>
          </View>
          <View style={styles.documentTitleContainer}>
            <Text style={styles.documentTitle}>
              {job.type === 'quotation' ? 'Cotización' : 'Factura'}
            </Text>
            <Text style={styles.documentId}>No. {job.id?.toString().padStart(4, '0')}</Text>
            <Text style={styles.value}>{format(job.date, "dd 'de' MMMM, yyyy", { locale: es })}</Text>
          </View>
        </View>

        {/* Client & Project Info */}
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.label}>Nombre / Razón Social</Text>
            <Text style={styles.value}>{client.name}</Text>
            <Text style={styles.label}>RFC / Tax ID</Text>
            <Text style={styles.value}>{client.taxId || 'N/A'}</Text>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>{client.address || 'N/A'}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>Proyecto</Text>
            <Text style={styles.label}>Descripción</Text>
            <Text style={styles.value}>{job.title}</Text>
            <Text style={styles.label}>Estado</Text>
            <Text style={styles.value}>{job.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Descripción del Material / Servicio</Text>
            <Text style={styles.colQty}>Cant.</Text>
            <Text style={styles.colPrice}>Precio Unit.</Text>
            <Text style={styles.colTotal}>Importe</Text>
          </View>
          {job.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Totals & Terms */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={styles.termsContainer}>
            <Text style={styles.sectionTitle}>Términos y Condiciones</Text>
            <Text style={{ fontSize: 8, color: '#666' }}>
              1. Esta cotización tiene una validez de 15 días naturales.{"\n"}
              2. Los precios están sujetos a cambios sin previo aviso.{"\n"}
              3. Se requiere un anticipo del 50% para iniciar el trabajo.{"\n"}
              4. El tiempo de entrega estimado se acordará una vez recibido el anticipo.
            </Text>
          </View>

          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={{ color: '#999' }}>Subtotal:</Text>
              <Text>{formatCurrency(totals.subtotal)}</Text>
            </View>
            {job.discountEnabled && (
              <View style={styles.totalRow}>
                <Text style={{ color: '#999' }}>Descuento ({job.discountPercent}%):</Text>
                <Text style={{ color: '#dc2626' }}>-{formatCurrency(totals.discount)}</Text>
              </View>
            )}
            {job.ivaEnabled && (
              <View style={styles.totalRow}>
                <Text style={{ color: '#999' }}>IVA ({job.ivaPercent}%):</Text>
                <Text>{formatCurrency(totals.iva)}</Text>
              </View>
            )}
            <View style={styles.finalTotalRow}>
              <Text>Total:</Text>
              <Text>{formatCurrency(totals.total)}</Text>
            </View>
          </View>
        </View>

        {/* Signature Area */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureLine}>
            <Text style={styles.label}>Aceptado por el Cliente</Text>
            <Text style={{ marginTop: 20 }}>_______________________</Text>
            <Text style={{ fontSize: 8, marginTop: 5 }}>Firma y Fecha</Text>
          </View>
          <View style={styles.signatureLine}>
            <Text style={styles.label}>Emitido por {settings.companyName}</Text>
            <Text style={{ marginTop: 20 }}>_______________________</Text>
            <Text style={{ fontSize: 8, marginTop: 5 }}>Sello y Firma</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Gracias por su confianza. Esta cotización tiene una vigencia de 15 días.</Text>
          <Text>{settings.companyName} - {settings.email}</Text>
        </View>
      </Page>
    </Document>
  );
};
