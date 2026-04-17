import { notFound } from "next/navigation";

import { PageIntro } from "@/components/shared/page-intro";
import { formatDate, formatMoney } from "@/lib/format";
import { readStore } from "@/lib/store";

export default async function InvoicePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const store = await readStore();
  const invoice = store.invoices.find((entry) => entry.id === id);

  if (!invoice) {
    notFound();
  }

  const job = store.jobs.find((entry) => entry.id === invoice.jobId) ?? null;
  const customer = job ? store.customers.find((entry) => entry.id === job.customerId) ?? null : null;
  const vehicle = job ? store.vehicles.find((entry) => entry.id === job.vehicleId) ?? null : null;

  return (
    <>
      <PageIntro
        eyebrow="Invoice"
        title={invoice.invoiceNumber}
        description="The invoice route is scaffolded so payment, printable summaries, and a future checkout flow already have a clear home."
      />

      <section className="panel">
        <dl className="key-value-list">
          <div>
            <dt>Customer</dt>
            <dd>{customer?.fullName ?? "Unknown"}</dd>
          </div>
          <div>
            <dt>Vehicle</dt>
            <dd>
              {vehicle?.make} {vehicle?.model}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{invoice.status}</dd>
          </div>
          <div>
            <dt>Issued at</dt>
            <dd>{formatDate(invoice.issuedAt)}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatMoney(invoice.total)}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
