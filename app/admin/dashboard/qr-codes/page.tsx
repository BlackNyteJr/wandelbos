import { QRCodeGenerator } from "@/components/admin/qr-generator"

export default function AdminQRPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-foreground">
          QR-Codes
        </h1>
        <p className="text-muted-foreground mt-1">
          Genereer en download QR-codes voor elke locatie op de wandelroute.
        </p>
      </div>
      <QRCodeGenerator />
    </div>
  )
}
