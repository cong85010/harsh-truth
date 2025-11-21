// Bill data structure for Harsh Truth Scanner
export interface BillData {
  // Header
  checkId: string;
  date: string;
  time: string;

  // Body
  confession: string;           // Lời khai từ user
  timesSaid: number;            // Số lần nói
  timesDone: number;            // Số lần làm
  delayHours: number;           // Thời gian trì hoãn gần nhất
  relatedActions: {             // Hành động liên quan
    name: string;
    count: number;
  }[];
  realPriority: number;         // Độ ưu tiên thực tế (%)

  // Footer
  bitterConclusion: string;     // Kết luận cay đắng
}

export interface ScannerState {
  input: string;
  isScanning: boolean;
  showBill: boolean;
  billData: BillData | null;
}
