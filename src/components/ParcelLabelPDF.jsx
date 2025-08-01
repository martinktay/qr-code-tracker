import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import QRCode from 'qrcode'

class ParcelLabelPDF {
  static async generateLabel(parcelData, parcelType) {
    try {
      // Generate QR code
      const qrCodeDataURL = await QRCode.toDataURL(parcelData.qr_code_url || `https://smartexporters.com/track/${parcelType}/${parcelData[`${parcelType}_id`]}`)
      
      // Create temporary HTML element for the label
      const labelElement = document.createElement('div')
      labelElement.style.width = '400px'
      labelElement.style.height = '300px'
      labelElement.style.padding = '20px'
      labelElement.style.backgroundColor = 'white'
      labelElement.style.fontFamily = 'Arial, sans-serif'
      labelElement.style.border = '2px solid #000'
      labelElement.style.position = 'absolute'
      labelElement.style.left = '-9999px'
      labelElement.style.top = '0'
      
      labelElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; height: 100%;">
          <!-- Left side - Company and parcel info -->
          <div style="flex: 1; padding-right: 20px;">
            <div style="text-align: center; margin-bottom: 15px;">
              <h2 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: bold;">The Smart Exporters</h2>
              <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">SmartExporters Logistics</p>
            </div>
            
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase;">${parcelType.toUpperCase()} INFORMATION</h3>
                                      <div style="font-size: 11px; line-height: 1.4;">
                          <p style="margin: 2px 0;"><strong>ID:</strong> ${parcelData[`${parcelType}_id`]}</p>
                          <p style="margin: 2px 0;"><strong>Content:</strong> ${parcelData.content}</p>
                          <p style="margin: 2px 0;"><strong>Quantity:</strong> ${parcelData.quantity}</p>
                          <p style="margin: 2px 0;"><strong>Weight:</strong> ${parcelData.weight_kg || 'N/A'} kg</p>
                          <p style="margin: 2px 0;"><strong>Destination:</strong> ${parcelData.destination}</p>
                          <p style="margin: 2px 0;"><strong>Status:</strong> ${parcelData.status?.replace('_', ' ').toUpperCase() || 'PACKED'}</p>
                        </div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase;">CUSTOMER</h3>
              <div style="font-size: 11px; line-height: 1.4;">
                <p style="margin: 2px 0;"><strong>Name:</strong> ${parcelData.customer?.first_name || ''} ${parcelData.customer?.last_name || ''}</p>
                <p style="margin: 2px 0;"><strong>Phone:</strong> ${parcelData.customer?.phone || ''}</p>
                <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(parcelData.created_at || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="margin: 0; font-size: 10px; color: #6b7280;">
                Scan QR code to track your package<br>
                www.smartexporters.com
              </p>
            </div>
          </div>
          
          <!-- Right side - QR Code -->
          <div style="text-align: center; padding-left: 20px;">
            <img src="${qrCodeDataURL}" style="width: 120px; height: 120px; border: 1px solid #d1d5db;" />
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #6b7280; font-weight: bold;">
              TRACKING QR CODE
            </p>
          </div>
        </div>
      `
      
      // Add to DOM temporarily
      document.body.appendChild(labelElement)
      
      // Convert to canvas
      const canvas = await html2canvas(labelElement, {
        width: 400,
        height: 300,
        scale: 2,
        useCORS: true,
        allowTaint: true
      })
      
      // Remove from DOM
      document.body.removeChild(labelElement)
      
      // Create PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      
      // Calculate dimensions to fit on A4
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = 120 // mm
      const imgHeight = 90 // mm
      const x = (pdfWidth - imgWidth) / 2
      const y = (pdfHeight - imgHeight) / 2
      
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
      
      // Add footer
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Generated by SmartExporters Logistics Platform', 10, pdfHeight - 10)
      pdf.text(new Date().toLocaleString(), pdfWidth - 10, pdfHeight - 10, { align: 'right' })
      
      // Save PDF
      const fileName = `${parcelType}_${parcelData[`${parcelType}_id`]}_label.pdf`
      pdf.save(fileName)
      
      return fileName
    } catch (error) {
      console.error('Error generating PDF label:', error)
      throw new Error('Failed to generate label PDF')
    }
  }

  static async generateBulkLabels(parcels, parcelType) {
    try {
      const pdf = new jsPDF('landscape', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      
      for (let i = 0; i < parcels.length; i++) {
        const parcel = parcels[i]
        
        // Generate QR code for this parcel
        const qrCodeDataURL = await QRCode.toDataURL(parcel.qr_code_url || `https://smartexporters.com/track/${parcelType}/${parcel[`${parcelType}_id`]}`)
        
        // Create label element
        const labelElement = document.createElement('div')
        labelElement.style.width = '400px'
        labelElement.style.height = '300px'
        labelElement.style.padding = '20px'
        labelElement.style.backgroundColor = 'white'
        labelElement.style.fontFamily = 'Arial, sans-serif'
        labelElement.style.border = '2px solid #000'
        labelElement.style.position = 'absolute'
        labelElement.style.left = '-9999px'
        labelElement.style.top = '0'
        
        labelElement.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; height: 100%;">
            <div style="flex: 1; padding-right: 20px;">
              <div style="text-align: center; margin-bottom: 15px;">
                <h2 style="margin: 0; color: #1f2937; font-size: 18px; font-weight: bold;">The Smart Exporters</h2>
                <p style="margin: 5px 0; color: #6b7280; font-size: 12px;">SmartExporters Logistics</p>
              </div>
              
              <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase;">${parcelType.toUpperCase()} INFORMATION</h3>
                                        <div style="font-size: 11px; line-height: 1.4;">
                          <p style="margin: 2px 0;"><strong>ID:</strong> ${parcel[`${parcelType}_id`]}</p>
                          <p style="margin: 2px 0;"><strong>Content:</strong> ${parcel.content}</p>
                          <p style="margin: 2px 0;"><strong>Quantity:</strong> ${parcel.quantity}</p>
                          <p style="margin: 2px 0;"><strong>Weight:</strong> ${parcel.weight_kg || 'N/A'} kg</p>
                          <p style="margin: 2px 0;"><strong>Destination:</strong> ${parcel.destination}</p>
                          <p style="margin: 2px 0;"><strong>Status:</strong> ${parcel.status?.replace('_', ' ').toUpperCase() || 'PACKED'}</p>
                        </div>
              </div>
              
              <div style="margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase;">CUSTOMER</h3>
                <div style="font-size: 11px; line-height: 1.4;">
                  <p style="margin: 2px 0;"><strong>Name:</strong> ${parcel.customer?.first_name || ''} ${parcel.customer?.last_name || ''}</p>
                  <p style="margin: 2px 0;"><strong>Phone:</strong> ${parcel.customer?.phone || ''}</p>
                  <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date(parcel.created_at || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="margin: 0; font-size: 10px; color: #6b7280;">
                  Scan QR code to track your package<br>
                  www.smartexporters.com
                </p>
              </div>
            </div>
            
            <div style="text-align: center; padding-left: 20px;">
              <img src="${qrCodeDataURL}" style="width: 120px; height: 120px; border: 1px solid #d1d5db;" />
              <p style="margin: 5px 0 0 0; font-size: 10px; color: #6b7280; font-weight: bold;">
                TRACKING QR CODE
              </p>
            </div>
          </div>
        `
        
        // Add to DOM temporarily
        document.body.appendChild(labelElement)
        
        // Convert to canvas
        const canvas = await html2canvas(labelElement, {
          width: 400,
          height: 300,
          scale: 2,
          useCORS: true,
          allowTaint: true
        })
        
        // Remove from DOM
        document.body.removeChild(labelElement)
        
        // Add to PDF
        const imgData = canvas.toDataURL('image/png')
        const imgWidth = 120
        const imgHeight = 90
        const x = (pdfWidth - imgWidth) / 2
        const y = (pdfHeight - imgHeight) / 2
        
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight)
        
        // Add page number
        pdf.setFontSize(8)
        pdf.setTextColor(107, 114, 128)
        pdf.text(`Page ${i + 1} of ${parcels.length}`, pdfWidth - 10, pdfHeight - 10, { align: 'right' })
        
        // Add new page if not the last parcel
        if (i < parcels.length - 1) {
          pdf.addPage()
        }
      }
      
      // Add footer to last page
      pdf.setFontSize(8)
      pdf.setTextColor(107, 114, 128)
      pdf.text('Generated by SmartExporters Logistics Platform', 10, pdfHeight - 10)
      pdf.text(new Date().toLocaleString(), pdfWidth - 10, pdfHeight - 10, { align: 'right' })
      
      // Save PDF
      const fileName = `bulk_${parcelType}_labels_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
      return fileName
    } catch (error) {
      console.error('Error generating bulk PDF labels:', error)
      throw new Error('Failed to generate bulk labels PDF')
    }
  }
}

export default ParcelLabelPDF 