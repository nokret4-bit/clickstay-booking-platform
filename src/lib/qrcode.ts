import QRCode from "qrcode";

export interface QRCodeData {
  bookingId: string;
  bookingCode: string;
  customerName: string;
  facilityUnit: string;
  checkInDate: string;
}

/**
 * Generate a QR code data URL for a booking
 * @param data - Booking data to encode in QR code
 * @returns Base64 data URL of the QR code image
 */
export async function generateBookingQRCode(
  data: QRCodeData
): Promise<string> {
  try {
    // Create a JSON string with booking information
    // Use 'code' key to match email QR format for scanner compatibility
    const qrData = JSON.stringify({
      code: data.bookingCode,
      name: data.customerName,
      facility: data.facilityUnit,
      checkIn: data.checkInDate,
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    return qrCodeDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}

/**
 * Parse QR code data back to booking information
 * @param qrData - JSON string from QR code scan
 * @returns Parsed booking data
 */
export function parseQRCodeData(qrData: string): QRCodeData {
  try {
    const data = JSON.parse(qrData);
    
    // Validate required fields
    if (!data.bookingId || !data.bookingCode) {
      throw new Error("Invalid QR code data");
    }

    return data as QRCodeData;
  } catch (error) {
    console.error("Error parsing QR code data:", error);
    throw new Error("Invalid QR code format");
  }
}
