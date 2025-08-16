"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Eye, Grid, List, Star, Award, Users, Phone, MessageCircle, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Billboard {
  id: string
  name: string
  location: string
  municipality: string
  city: string
  area: string
  size: string
  level: string
  status: string
  expiryDate: string | null
  coordinates: string
  imageUrl: string
  gpsLink: string
}

export default function BillboardsPage() {
  const [billboards, setBillboards] = useState<Billboard[]>([])
  const [filteredBillboards, setFilteredBillboards] = useState<Billboard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMunicipality, setSelectedMunicipality] = useState("all")
  const [selectedSize, setSelectedSize] = useState("all")
  const [selectedAvailability, setSelectedAvailability] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showAllBillboards, setShowAllBillboards] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMapBillboard, setSelectedMapBillboard] = useState<Billboard | null>(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)

  const itemsPerPage = 12

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        console.log("[v0] بدء تحميل البيانات من ملف الإكسل...")
        setLoading(true)

        const response = await fetch("/api/billboards", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.log("[v0] استجابة غير ناجحة من API:", response.status, response.statusText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          console.log("[v0] الاستجابة ليست JSON:", contentType)
          throw new Error("Response is not JSON")
        }

        const data = await response.json()

        if (data.error && data.fallback) {
          console.log("[v0] API أرجع خطأ مع إشارة للاستخدام الاحتياطي:", data.error)
          throw new Error(data.error)
        }

        if (data.error) {
          throw new Error(data.error)
        }

        console.log("[v0] تم تحميل البيانات من الإكسل بنجاح، عدد اللوحات:", data.billboards.length)
        setBillboards(data.billboards)
        setFilteredBillboards(data.billboards.slice(0, 5))
        setLoading(false)
      } catch (error) {
        console.error("[v0] خطأ في تحميل ملف الإكسل:", error)

        const fallbackData: Billboard[] = [
          {
            id: "132",
            name: "KH-SK0132",
            location: "الجزيرة الجديدة مدخل شارع 20",
            municipality: "الخمس",
            city: "الخمس",
            area: "منطقة 1",
            size: "12X4",
            level: "B",
            status: "متاح",
            expiryDate: null,
            coordinates: "32.639466,14.265113",
            imageUrl: "https://lh3.googleusercontent.com/d/1IXWjRnWIqrRnsCIR1UEdsrWqqNeDW8eL",
            gpsLink: "https://www.google.com/maps?q=32.639466,14.265113",
          },
          {
            id: "943",
            name: "TR-TG0943",
            location: "امام كلية الهندسة العسكرية باتجاه الشرق",
            municipality: "تاجوراء",
            city: "طرابلس",
            area: "منطقة 2",
            size: "12X4",
            level: "A",
            status: "متاح",
            expiryDate: null,
            coordinates: "32.77941062678118,13.202820303855821",
            imageUrl: "https://lh3.googleusercontent.com/d/1y3u807ziWfFgaYpsUlA3Rufmu7vyzY7u",
            gpsLink: "https://www.google.com/maps?q=32.77941062678118,13.202820303855821",
          },
          {
            id: "134",
            name: "KH-SK0134",
            location: "بجوار كوبري سوق الخميس باتجاه الشرق",
            municipality: "الخمس",
            city: "الخمس",
            area: "منطقة 3",
            size: "12X4",
            level: "B",
            status: "متاح",
            expiryDate: null,
            coordinates: "32.566533,14.344944",
            imageUrl: "https://lh3.googleusercontent.com/d/1J1D2ZEhnQZbRuSKxNVE4XTifkhvHabYs",
            gpsLink: "https://www.google.com/maps?q=32.566533,14.344944",
          },
          {
            id: "917",
            name: "TR-JZ0917",
            location: "بعد مخرج السراج بـ800 متر",
            municipality: "جنزور",
            city: "طرابلس",
            area: "منطقة 4",
            size: "12x4",
            level: "A",
            status: "متاح",
            expiryDate: null,
            coordinates: "32.838179,13.071658",
            imageUrl: "/roadside-billboard.png",
            gpsLink: "https://www.google.com/maps?q=32.838179,13.071658",
          },
          {
            id: "130",
            name: "KH-SK0130",
            location: "بجوار جسر سوق الخميس باتجاه الغرب",
            municipality: "الخمس",
            city: "الخمس",
            area: "منطقة 5",
            size: "12X4",
            level: "B",
            status: "متاح",
            expiryDate: null,
            coordinates: "32.566533,14.344944",
            imageUrl: "https://lh3.googleusercontent.com/d/1iHHF-cuvAvgs0-gpW65zkxFrLU2qV7bE",
            gpsLink: "https://www.google.com/maps?q=32.566533,14.344944",
          },
          {
            id: "140",
            name: "ZL-ZL0140",
            location: "مدخل المدينة الغربي بجوار كمرة كعام باتجاه الشرق",
            municipality: "زليتن",
            city: "زليتن",
            area: "منطقة 6",
            size: "12X4",
            level: "B",
            status: "متاح",
            expiryDate: null,
            coordinates: "32.498982,14.446801",
            imageUrl: "https://lh3.googleusercontent.com/d/1_js8MPBTvM_ymwPNm1oedZfjtDuMPIfj",
            gpsLink: "https://www.google.com/maps?q=32.498982,14.446801",
          },
        ]

        console.log("[v0] تم استخدام البيانات الاحتياطية، عدد اللوحات:", fallbackData.length)
        setBillboards(fallbackData)
        setFilteredBillboards(fallbackData.slice(0, 5))
        setLoading(false)
      }
    }

    loadExcelData()
  }, [])

  useEffect(() => {
    if (showMap && !mapInstanceRef.current) {
      const initializeMap = async () => {
        if (!document.querySelector('link[href*="leaflet"]')) {
          const leafletCSS = document.createElement("link")
          leafletCSS.rel = "stylesheet"
          leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(leafletCSS)
        }

        if (!window.L) {
          await new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.onload = resolve
            document.head.appendChild(script)
          })
        }

        if (mapRef.current && window.L && !mapInstanceRef.current) {
          const map = window.L.map(mapRef.current).setView([32.7, 13.2], 8)

          window.L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution:
                '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
              maxZoom: 18,
            },
          ).addTo(map)

          const streetLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            opacity: 0,
          }).addTo(map)

          const baseLayers = {
            "صور الأقمار الصناعية": window.L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              {
                attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
                maxZoom: 18,
              },
            ),
            "خريطة الشوارع": window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }),
          }

          window.L.control.layers(baseLayers).addTo(map)

          const companyIcon = window.L.divIcon({
            html: `<div class="flex flex-col items-center">
                     <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce mb-2">
                       <img src="/logo-symbol.svg" alt="رمز الشركة" class="w-10 h-10 object-contain" />
                     </div>
                   </div>`,
            className: "custom-div-icon",
            iconSize: [80, 80],
            iconAnchor: [40, 40],
          })

          window.L.marker([32.4847, 14.5959], { icon: companyIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center p-4">
                <div class="flex flex-col items-center mb-3">
                  <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2">
                    <img src="/logo-symbol.svg" alt="رمز الشركة" class="w-8 h-8 object-contain" />
                  </div>
                </div>
                <h3 class="font-bold text-lg text-yellow-600 mb-2">مقر الفارس الذهبي</h3>
                <p class="text-gray-600 mb-3">للدعاية والإعلان</p>
                <button onclick="window.open('https://www.google.com/maps?q=32.4847,14.5959', '_blank')" 
                        class="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg transform hover:scale-105 transition-all duration-300">
                  فتح في خرائط جوجل
                </button>
              </div>
            `)

          mapInstanceRef.current = map

          addBillboardMarkers(map, filteredBillboards)
        }
      }

      initializeMap()
    }
  }, [showMap])

  const addBillboardMarkers = (map: any, billboardsToShow: Billboard[]) => {
    if (!map || !window.L) return

    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.billboardId) {
        map.removeLayer(layer)
      }
    })

    billboardsToShow.forEach((billboard) => {
      const coords = billboard.coordinates.split(",").map((coord) => Number.parseFloat(coord.trim()))
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return

      const [lat, lng] = coords

      const billboardIcon = window.L.divIcon({
        html: `<div class="w-8 h-8 bg-green-500 rounded-full border-2 border-white shadow-lg hover:scale-125 transition-all duration-300 cursor-pointer flex items-center justify-center">
                 <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                   <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                 </svg>
               </div>`,
        className: "custom-billboard-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = window.L.marker([lat, lng], {
        icon: billboardIcon,
        billboardId: billboard.id,
      }).addTo(map)

      const popupContent = `
        <div class="p-3 min-w-64">
          <h3 class="font-bold text-lg mb-2">${billboard.name}</h3>
          <p class="text-gray-600 mb-2">${billboard.location}</p>
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">${billboard.size}</span>
            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">${billboard.municipality}</span>
            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">${billboard.status}</span>
          </div>
          <div class="flex gap-2">
            <button onclick="document.dispatchEvent(new CustomEvent('showBillboardImage', {detail: '${billboard.imageUrl}'}))" 
                    class="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded-full text-xs font-bold">
              عرض الصورة
            </button>
            <button onclick="window.open('${billboard.gpsLink}', '_blank')" 
                    class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
              خرائط جوجل
            </button>
          </div>
        </div>
      `

      marker.bindPopup(popupContent)
    })
  }

  useEffect(() => {
    const handleShowImage = (event: any) => {
      setSelectedImage(event.detail)
    }

    document.addEventListener("showBillboardImage", handleShowImage)
    return () => document.removeEventListener("showBillboardImage", handleShowImage)
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && showMap) {
      addBillboardMarkers(mapInstanceRef.current, filteredBillboards)
    }
  }, [filteredBillboards, showMap])

  const getAvailabilityStatus = (billboard: Billboard) => {
    return billboard.status
  }

  useEffect(() => {
    let filtered = billboards

    console.log(
      "[v0] توزيع حالات اللوحات:",
      billboards.reduce((acc: any, billboard) => {
        acc[billboard.status] = (acc[billboard.status] || 0) + 1
        return acc
      }, {}),
    )

    if (searchTerm) {
      filtered = filtered.filter(
        (billboard) =>
          billboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billboard.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billboard.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billboard.area.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedMunicipality !== "all") {
      filtered = filtered.filter((billboard) => billboard.municipality === selectedMunicipality)
    }

    if (selectedSize !== "all") {
      filtered = filtered.filter((billboard) => billboard.size === selectedSize)
    }

    if (selectedAvailability !== "all") {
      filtered = filtered.filter((billboard) => {
        const status = getAvailabilityStatus(billboard)
        if (selectedAvailability === "available") {
          return status === "متاح"
        } else if (selectedAvailability === "soon") {
          return status === "قريباً"
        }
        return true
      })
    }

    if (!showAllBillboards) {
      filtered = filtered.slice(0, 5)
      setCurrentPage(1)
    }

    setFilteredBillboards(filtered)
  }, [searchTerm, selectedMunicipality, selectedSize, selectedAvailability, billboards, showAllBillboards])

  const municipalities = Array.from(new Set(billboards.map((b) => b.municipality)))
  const sizes = Array.from(new Set(billboards.map((b) => b.size)))

  const totalPages = Math.ceil(filteredBillboards.length / itemsPerPage)
  const paginatedBillboards = showAllBillboards
    ? filteredBillboards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredBillboards

  const getPageNumbers = () => {
    const maxPages = 5
    const pages = []

    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const start = Math.max(1, currentPage - 2)
      const end = Math.min(totalPages, start + maxPages - 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  const handleDownloadPDF = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>المساحات الإعلانية المتاحة - الفارس الذهبي</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Tajawal', 'Arial', sans-serif; 
            direction: rtl; 
            background: white;
            color: #000;
            line-height: 1.3;
            font-size: 9px;
          }
          .header { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px; 
            padding: 10px 0;
            border-bottom: 2px solid #D4AF37;
          }
          .logo-section {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .logo { 
            width: 60px; 
            height: 60px; 
            object-fit: contain;
          }
          .company-info {
            text-align: right;
          }
          .company-name-ar { 
            font-size: 14px; 
            font-weight: 700; 
            color: #000; 
            margin-bottom: 2px;
          }
          .company-name-en { 
            font-size: 10px; 
            color: #666;
            font-weight: 400;
          }
          .title-section {
            text-align: center;
            flex: 1;
          }
          .report-title { 
            font-size: 16px; 
            font-weight: 700; 
            color: #000;
            background: #D4AF37;
            padding: 5px 15px;
            border-radius: 18px;
            display: inline-block;
          }
          .page-info {
            position: fixed;
            top: 8mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #666;
            font-weight: 500;
          }
          .page-number {
            position: fixed;
            bottom: 8mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #666;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 15px;
            font-size: 8px;
          }
          th, td { 
            border: 1px solid #D4AF37; 
            padding: 3px 2px; 
            text-align: center;
            vertical-align: middle;
          }
          th { 
            background: #D4AF37; 
            color: #000; 
            font-weight: 700;
            font-size: 9px;
            height: 30px;
          }
          tr:nth-child(even) { 
            background: #FFFEF7; 
          }
          .billboard-image {
            width: 50px;
            height: 38px;
            object-fit: cover;
            border-radius: 3px;
            border: 1px solid #D4AF37;
            display: block;
            margin: 0 auto;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          .billboard-number {
            color: #000;
            font-weight: 700;
            font-size: 8px;
            padding: 1px;
          }
          .status-available { 
            color: #059669; 
            font-weight: 700;
            font-size: 7px;
          }
          .coordinates-link {
            color: #1D4ED8;
            text-decoration: none;
            font-size: 7px;
            font-weight: 500;
            display: inline-block;
            padding: 1px 2px;
          }
          .image-placeholder {
            width: 50px;
            height: 38px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #D4AF37;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 6px;
            color: #666;
            text-align: center;
            margin: 0 auto;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          }
          @media print {
            body { 
              print-color-adjust: exact; 
              -webkit-print-color-adjust: exact;
            }
            .no-print { display: none; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            .billboard-image, .image-placeholder {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="page-info">صفحة 1 من 1 - إجمالي ${filteredBillboards.length} لوحة إعلانية</div>
        
        <div class="header">
          <div class="logo-section">
            <img src="${window.location.origin}/logofares.svg" alt="شعار الشركة" class="logo" onerror="this.style.display='none'" />
            <div class="company-info">
              <div class="company-name-ar">الفــــارس الذهبــــي</div>
              <div class="company-name-en">AL FARES AL DAHABI</div>
              <div class="company-name-ar" style="font-size: 9px;">للدعــــــايــة والإعــــلان</div>
            </div>
          </div>
          <div class="title-section">
            <div class="report-title">المساحات الإعلانية المتاحة</div>
          </div>
        </div>

        <div class="page-number">صفحة 1</div>

        <table>
          <thead>
            <tr>
              <th style="width: 12%;">صورة الوحة</th>
              <th style="width: 10%;">رقم الوحة</th>
              <th style="width: 18%;">موقع الوحة</th>
              <th style="width: 12%;">البلدية</th>
              <th style="width: 12%;">المنطقة</th>
              <th style="width: 22%;">أقرب نقطة دالة</th>
              <th style="width: 8%;">المقاس</th>
              <th style="width: 6%;">الحالة</th>
              <th style="width: 12%;">عرض على الخريطة</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBillboards
              .map(
                (billboard, index) => `
              <tr style="height: 45px;">
                <td>
                  ${
                    billboard.imageUrl
                      ? `
                    <img src="${billboard.imageUrl}" 
                         alt="صورة اللوحة ${billboard.name}" 
                         class="billboard-image"
                         onload="this.style.display='block'"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-placeholder" style="display:none;">
                      <span>صورة<br>اللوحة</span>
                    </div>
                  `
                      : `
                    <div class="image-placeholder">
                      <span>صورة<br>اللوحة</span>
                    </div>
                  `
                  }
                </td>
                <td><div class="billboard-number">TR-${String(index + 1).padStart(6, "0")}</div></td>
                <td style="font-weight: 500; text-align: right; padding-right: 4px; font-size: 8px;">${billboard.location}</td>
                <td style="font-size: 7px;">${billboard.municipality}</td>
                <td style="font-size: 7px;">${billboard.area}</td>
                <td style="text-align: right; padding-right: 3px; font-size: 7px;">${billboard.name}</td>
                <td style="font-weight: 500; font-size: 7px;">${billboard.size}</td>
                <td><span class="status-available">متاح</span></td>
                <td>
                  ${
                    billboard.coordinates
                      ? `<span class="coordinates-link">عرض الموقع</span>`
                      : '<span style="color: #666; font-size: 7px;">غير متوفر</span>'
                  }
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
    }
  }

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>المساحات الإعلانية المتاحة - الفارس الذهبي</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 12mm;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Tajawal', 'Arial', sans-serif; 
            direction: rtl; 
            background: white;
            color: #000;
            line-height: 1.3;
            font-size: 10px;
          }
          .header { 
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px; 
            padding: 12px 0;
            border-bottom: 2px solid #D4AF37;
          }
          .logo-section {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo { 
            width: 70px; 
            height: 70px; 
            object-fit: contain;
          }
          .company-info {
            text-align: right;
          }
          .company-name-ar { 
            font-size: 16px; 
            font-weight: 700; 
            color: #000; 
            margin-bottom: 2px;
          }
          .company-name-en { 
            font-size: 12px; 
            color: #666;
            font-weight: 400;
          }
          .title-section {
            text-align: center;
            flex: 1;
          }
          .report-title {  {
            text-align: center;
            flex: 1;
          }
          .report-title {
            font-size: 18px;
            font-weight: 700;
            color: #000;
            background: #D4AF37;
            padding: 6px 18px;
            border-radius: 20px;
            display: inline-block;
          }
          .page-number {
            position: fixed;
            bottom: 8mm;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 9px;
          }
          th, td {
            border: 1px solid #D4AF37;
            padding: 4px 3px;
            text-align: center;
            vertical-align: #D4AF37;
            padding: 4px 3px;
            text-align: center;
            vertical-align: middle;
          }
          th {
            background: #D4AF37;
            vertical-align: middle;
          }
          th {
            background: #D4AF37;

            vertical-align: middle;
          }
          th {
            background: #D4AF37;
            color: #000;
            font-weight: 700;
            font-size: 10px;
            height: 35px;
          }
          tr:nth-child(even) {
            background: #FFFEF7;
          }
          .billboard-image {
            width: 60px;
            height: 45px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #D4AF37;
            display: block;
            margin: 0 auto;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .billboard-number {
            color: #000;
            font-weight: 700;
            font-size: 9px;
            padding: 2px;
          }
          .status-available {
            color: #059669;
            font-weight: 700;
            font-size: 8px;
          }
          .status-unavailable {
            color: #DC2626;
            font-weight: 700;
            font-size: 8px;
          }
          .coordinates-link {
            color: #1D4ED8;
            text-decoration: underline;
            font-size: 8px;
            font-weight: 500;
            display: inline-block;
            padding: 2px 4px;
          }
          .image-placeholder {
            width: 60px;
            height: 45px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 1px solid #D4AF37;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 7px;
            color: #666;
            text-align: center;
            margin: 0 auto;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            .no-print { display: none; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            .billboard-image, .image-placeholder {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            <img src="${window.location.origin}/logofares.svg" alt="شعار الشركة" class="logo" onerror="this.style.display='none'" />
            <div class="company-info">
              <div class="company-name-ar">الفــــارس الذهبــــي</div>
              <div class="company-name-en">AL FARES AL DAHABI</div>
              <div class="company-name-ar" style="font-size: 10px;">للدعــــــايــة والإعــــلان</div>
            </div>
          </div>
          <div class="title-section">
            <div class="report-title">المساحات الإعلانية المتاحة</div>
          </div>
        </div>

        <div class="page-number">صفحة 1</div>

        <table>
          <thead>
            <tr>
              <th style="width: 14%;">صورة الوحة</th>
              <th style="width: 10%;">رقم الوحة</th>
              <th style="width: 16%;">موقع الوحة</th>
              <th style="width: 12%;">البلدية</th>
              <th style="width: 12%;">المنطقة</th>
              <th style="width: 20%;">أقرب نقطة دالة</th>
              <th style="width: 10%;">المقاس</th>
              <th style="width: 8%;">الحالة</th>
              <th style="width: 14%;">عرض على الخريطة</th>
            </tr>
          </thead>
          <tbody>
            ${filteredBillboards
              .map(
                (billboard, index) => `
              <tr style="height: 55px;">
                <td>
                  ${
                    billboard.imageUrl
                      ? `
                    <img src="${billboard.imageUrl}"
                         alt="صورة اللوحة ${billboard.name}"
                         class="billboard-image"
                         onload="this.style.display='block'"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="image-placeholder" style="display:none;">
                      <span>صورة<br>اللوحة</span>
                    </div>
                  `
                      : `
                    <div class="image-placeholder">
                      <span>صورة<br>اللوحة</span>
                    </div>
                  `
                  }
                </td>
                <td><div class="billboard-number">TR-${String(index + 1).padStart(6, "0")}</div></td>
                <td style="font-weight: 500; text-align: right; padding-right: 6px; font-size: 9px;">${billboard.location}</td>
                <td style="font-size: 8px;">${billboard.municipality}</td>
                <td style="font-size: 8px;">${billboard.area}</td>
                <td style="text-align: right; padding-right: 4px; font-size: 8px;">${billboard.name}</td>
                <td style="font-weight: 500; font-size: 8px;">${billboard.size}</td>
                <td><span class="status-available">متاح</span></td>
                <td>
                  ${
                    billboard.coordinates
                      ? `
                    <a href="https://www.google.com/maps?q=${billboard.coordinates}"
                       target="_blank"
                       class="coordinates-link">
                      عرض الموقع
                    </a>
                  `
                      : '<span style="color: #666; font-size: 8px;">غير متوفر</span>'
                  }
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            }, 500);
          };
        </script>
      </body>
      </html>
    `

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-yellow-400/30 animate-pulse mb-4">
              <img src="logo-symbol.svg" alt="رمز الشركة" className="w-16 h-16 object-contain" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">جاري تحميل البيانات...</h2>
          <p className="text-lg font-semibold text-gray-700">يتم قراءة البيانات</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      <div className="fixed top-1/2 right-4 transform -translate-y-1/2 opacity-20 pointer-events-none z-0">
        <img src="/logo-symbol.svg" alt="رمز الشركة" className="w-[600px] h-[600px] object-contain" />
      </div>

      <header className="bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-2xl border-b-4 border-yellow-500 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <div className="relative">
                <div className="flex items-center gap-4 flex-row">
                  <img src="/new-logo.svg" alt="شعار الشركة" className="h-20 object-contain" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-black px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 text-lg">
              احجز موقعك الآن
            </Button>
          </div>
        </div>
      </header>

      {!showAllBillboards && (
        <>
          <section className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black py-16 relative z-10">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                الرائدون في عالم الدعاية والإعلان
              </h2>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed font-bold">
                نحن نقدم حلول إعلانية متكاملة ومبتكرة تضمن وصول رسالتك إلى الجمهور المناسب في الوقت المناسب
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <Award className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="text-3xl font-black mb-2">+15</h3>
                  <p className="text-lg font-bold">سنة خبرة</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <Users className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="text-3xl font-black mb-2">+800</h3>
                  <p className="text-lg font-bold">عميل راضي</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="text-3xl font-black mb-2">+900</h3>
                  <p className="text-lg font-bold">موقع إعلاني</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <Star className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="text-3xl font-black mb-2">100%</h3>
                  <p className="text-lg font-bold">جودة مضمونة</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-12 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">اللوحات الإعلانية المتاحة</h2>
            <p className="text-xl font-semibold text-gray-700">اختر الموقع المثالي لإعلانك من مجموعتنا المتنوعة</p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              type="text"
              placeholder="ابحث عن اللوحات (الاسم، الموقع، البلدية، المنطقة)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12 text-right border-2 border-yellow-300 focus:border-yellow-500 rounded-full py-4 text-lg shadow-lg"
            />
          </div>

          <div className="flex flex-wrap gap-6 items-center justify-center">
            <div className="flex flex-wrap gap-4">
              <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                <SelectTrigger className="w-48 border-2 border-yellow-300 rounded-full">
                  <SelectValue placeholder="جميع البلديات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البلديات</SelectItem>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger className="w-48 border-2 border-yellow-300 rounded-full">
                  <SelectValue placeholder="جميع المقاسات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المقاسات</SelectItem>
                  {sizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="w-48 border-2 border-yellow-300 rounded-full">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="available">متاحة</SelectItem>
                  <SelectItem value="soon">متاحة قريباً</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowMap(!showMap)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <MapPin className="w-5 h-5 ml-2" />
                {showMap ? "إخفاء الخريطة" : "عرض الخريطة"}
              </Button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-yellow-400"
              >
                <FileDown className="w-5 h-5" />
                <span className="text-sm">حفظ التقرير PDF</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-full"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-full"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {showMap && (
          <div className="mb-12">
            <Card className="overflow-hidden shadow-2xl border-4 border-yellow-300">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black p-4">
                  <h3 className="text-2xl font-black text-center">
                    خريطة المواقع الإعلانية التفاعلية - صور الأقمار الصناعية
                  </h3>
                  <p className="text-center mt-2 text-sm font-semibold">
                    يمكنك التحرك والتكبير بحرية - النقاط مثبتة على الإحداثيات الصحيحة
                  </p>
                </div>
                <div className="h-96 relative">
                  <div ref={mapRef} className="w-full h-full" style={{ minHeight: "400px" }} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-700 text-lg font-semibold">
            عرض <span className="font-black text-yellow-600">{paginatedBillboards.length}</span> من أصل
            <span className="font-black text-yellow-600">{filteredBillboards.length}</span> لوحة متاحة
          </p>

          {showAllBillboards && totalPages > 1 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-600">الصفحة:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = Number.parseInt(e.target.value)
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page)
                    }
                  }}
                  className="w-16 px-2 py-1 text-center border border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <span className="text-sm font-semibold text-gray-600">من {totalPages}</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                >
                  التالي
                </Button>
              </div>
            </div>
          )}

          {!showAllBillboards && billboards.length > 3 && (
            <Button
              onClick={() => setShowAllBillboards(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-black px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              عرض جميع اللوحات ({billboards.length})
            </Button>
          )}

          {showAllBillboards && (
            <Button
              onClick={() => {
                setShowAllBillboards(false)
                setCurrentPage(1)
              }}
              variant="outline"
              className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-black px-6 py-3 rounded-full"
            >
              عرض أقل
            </Button>
          )}
        </div>

        <div
          className={`grid gap-8 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
        >
          {paginatedBillboards.map((billboard) => (
            <Card
              key={billboard.id}
              className="overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 hover:border-yellow-400 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
            >
              <div className="relative">
                <img
                  src={billboard.imageUrl || "/roadside-billboard.png"}
                  alt={billboard.name}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/roadside-billboard.png"
                  }}
                />
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-lg px-4 py-2 rounded-full shadow-lg">
                  {billboard.size}
                </Badge>
                <Button
                  size="sm"
                  className="absolute top-4 left-4 bg-black/80 hover:bg-black text-white rounded-full px-4 py-2 shadow-lg"
                  onClick={() => setSelectedImage(billboard.imageUrl)}
                >
                  <Eye className="w-4 h-4 ml-1" />
                  عرض
                </Button>
              </div>

              <CardContent className="p-4">
                <div className="text-right space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-xl font-black text-gray-900 leading-tight">{billboard.name}</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start text-gray-700 justify-between">
                      <MapPin className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div className="text-right flex-1">
                        <p className="text-base font-bold leading-snug">{billboard.location}</p>
                        <p className="text-sm text-gray-600 mt-1 font-semibold">{billboard.area}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 py-2">
                    <Badge className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-3 py-1.5 rounded-full font-black text-sm">
                      {billboard.municipality}
                    </Badge>
                    <Badge
                      className={`border px-3 py-1.5 rounded-full font-black text-sm ${
                        billboard.status === "متاح"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : billboard.status === "قريباً"
                            ? "bg-orange-50 text-orange-800 border-orange-200"
                            : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {billboard.status}
                    </Badge>
                  </div>

                  <div className="pt-1">
                    <Button
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-black py-3 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-base"
                      onClick={() => window.open(billboard.gpsLink, "_blank")}
                    >
                      <MapPin className="w-4 h-4 ml-2" />
                      عرض الموقع على الخريطة
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showAllBillboards && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
            >
              السابق
            </Button>

            {getPageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-12 h-12 ${
                  currentPage === pageNum
                    ? "bg-yellow-500 text-black hover:bg-yellow-600"
                    : "border-yellow-400 text-yellow-600 hover:bg-yellow-50"
                }`}
              >
                {pageNum}
              </Button>
            ))}

            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
            >
              التالي
            </Button>
          </div>
        )}

        {filteredBillboards.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-yellow-500" />
            </div>
            <p className="text-gray-600 text-xl mb-4 font-bold">لا توجد لوحات تطابق معايير البحث</p>
            <p className="text-gray-500 font-semibold">جرب تغيير معايير البحث أو الفلاتر</p>
          </div>
        )}
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="عرض اللوحة"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <Button
              className="absolute top-4 right-4 bg-white text-black hover:bg-gray-100 rounded-full px-6 py-2 shadow-lg"
              onClick={() => setSelectedImage(null)}
            >
              إغلاق
            </Button>
          </div>
        </div>
      )}

      <footer className="bg-gradient-to-r from-black via-gray-900 to-black text-white py-12 mt-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
            <div>
              <div className="flex items-center justify-center md:justify-start mb-6">
                <div className="flex items-center gap-3">
                  <img src="new-logo.svg" alt="رمز الشركة" className="h-16 object-contain" />
                </div>
              </div>
              <p className="text-gray-400 font-semibold">شريكك المثالي في عالم الدعاية والإعلان</p>
            </div>

            <div>
              <h4 className="text-xl font-black text-yellow-400 mb-6">تواصل معنا</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-5 h-5 text-yellow-400 ml-3" />
                  <a
                    href="tel:+218913228908"
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 hover:underline"
                  >
                    +218.91.322.8908
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-5 h-5 text-yellow-400 ml-3" />
                  <a
                    href="tel:+218913228908"
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 hover:underline"
                  >
                    +218.91.322.8908
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MessageCircle className="w-5 h-5 text-green-400 ml-3" />
                  <a
                    href="https://wa.me/218913228908?text=مرحباً، أريد الاستفسار عن اللوحات الإعلانية المتاحة"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-green-400 transition-colors duration-300 hover:underline"
                  >
                    واتساب: +218.91.322.8908
                  </a>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-black text-yellow-400 mb-6">موقعنا</h4>
              <div className="space-y-4">
                <p className="text-gray-300 font-semibold">زليتن - ليبيا</p>
                <p className="text-gray-300 font-semibold">بجوار مدرسة عقبة بن نافع</p>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-black px-6 py-2 rounded-full transform hover:scale-105 transition-all duration-300"
                  onClick={() => window.open("https://www.google.com/maps?q=32.4847,14.5959", "_blank")}
                >
                  <MapPin className="w-4 h-4 ml-2" />
                  عرض على الخريطة
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 font-semibold">© 2024 جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
