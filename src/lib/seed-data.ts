import type { GarageFlowStore } from "@/lib/types";

export const seedData: GarageFlowStore = {
  shops: [
    {
      id: "shop_1",
      name: "GarageFlow Motors",
      phone: "+387 61 210 844",
      email: "desk@garageflow.app",
      address: "Industrial Road 18, Sarajevo"
    }
  ],
  users: [
    {
      id: "user_owner",
      shopId: "shop_1",
      fullName: "Nina Kolar",
      email: "owner@garageflow.app",
      password: "garageflow",
      role: "owner"
    },
    {
      id: "user_advisor",
      shopId: "shop_1",
      fullName: "Emir Zec",
      email: "advisor@garageflow.app",
      password: "garageflow",
      role: "advisor"
    },
    {
      id: "user_tech",
      shopId: "shop_1",
      fullName: "Lejla Hadzic",
      email: "tech@garageflow.app",
      password: "garageflow",
      role: "technician"
    }
  ],
  customers: [
    {
      id: "customer_1",
      shopId: "shop_1",
      fullName: "Adnan Music",
      phone: "+387 62 334 221",
      email: "adnan@example.com",
      address: "Bjelave 24, Sarajevo",
      notes: "Prefers text message updates before extra labor."
    },
    {
      id: "customer_2",
      shopId: "shop_1",
      fullName: "Mia Kovac",
      phone: "+387 63 998 120",
      email: "mia@example.com",
      address: "Nova cesta 41, Mostar",
      notes: "Usually picks up after 17:00."
    }
  ],
  vehicles: [
    {
      id: "vehicle_1",
      shopId: "shop_1",
      customerId: "customer_1",
      vin: "WAUZZZF41KA013842",
      plateNumber: "K87-T-442",
      make: "Audi",
      model: "A4",
      year: 2019,
      engine: "2.0 TDI",
      color: "Daytona Grey",
      mileage: 126540
    },
    {
      id: "vehicle_2",
      shopId: "shop_1",
      customerId: "customer_2",
      vin: "WVWZZZAUZKW145981",
      plateNumber: "M44-K-908",
      make: "Volkswagen",
      model: "Golf 7",
      year: 2018,
      engine: "1.6 TDI",
      color: "Deep Black",
      mileage: 181200
    }
  ],
  jobs: [
    {
      id: "job_1",
      shopId: "shop_1",
      customerId: "customer_1",
      vehicleId: "vehicle_1",
      jobNumber: "GF-24015",
      status: "waiting_approval",
      complaint: "Brake warning light and steering vibration during highway braking.",
      internalNotes: "Front discs heavily scored. Rear pads still within range.",
      assignedAdvisorId: "user_advisor",
      assignedTechnicianId: "user_tech",
      checkInAt: "2026-04-15T08:00:00.000Z",
      dueAt: "2026-04-16T16:00:00.000Z",
      completedAt: null
    },
    {
      id: "job_2",
      shopId: "shop_1",
      customerId: "customer_2",
      vehicleId: "vehicle_2",
      jobNumber: "GF-24016",
      status: "in_progress",
      complaint: "Air conditioning weak and engine service due.",
      internalNotes: "Cabin filter replaced. Compressor pressure test okay.",
      assignedAdvisorId: "user_owner",
      assignedTechnicianId: "user_tech",
      checkInAt: "2026-04-15T09:30:00.000Z",
      dueAt: "2026-04-15T18:00:00.000Z",
      completedAt: null
    }
  ],
  estimates: [
    {
      id: "estimate_1",
      jobId: "job_1",
      status: "sent",
      subtotal: 380,
      tax: 64.6,
      total: 444.6,
      notes: "Front disc and pad replacement with fluid top-up."
    }
  ],
  approvals: [
    {
      id: "approval_1",
      estimateId: "estimate_1",
      token: "approve-brakes-24015",
      status: "pending",
      customerMessage: ""
    }
  ],
  invoices: [
    {
      id: "invoice_1",
      jobId: "job_2",
      invoiceNumber: "INV-24016",
      status: "issued",
      subtotal: 190,
      tax: 32.3,
      total: 222.3,
      issuedAt: "2026-04-15T14:30:00.000Z",
      paidAt: null
    }
  ],
  timeline: [
    {
      id: "event_1",
      jobId: "job_1",
      type: "status_change",
      message: "Job moved to waiting approval after brake inspection.",
      createdAt: "2026-04-15T09:15:00.000Z"
    },
    {
      id: "event_2",
      jobId: "job_2",
      type: "note",
      message: "Service kit in stock. Technician started oil and filter change.",
      createdAt: "2026-04-15T10:05:00.000Z"
    }
  ]
};
