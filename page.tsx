"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Eye, Grid, List, Star, Award, Users, Phone, MessageCircle } from "lucide-react"
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
  size: string
  level: string
  status: string
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
    if (showMap && !mapInstanceRef.current) {
      const initializeMap = async () => {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet"]')) {
          const leafletCSS = document.createElement("link")
          leafletCSS.rel = "stylesheet"
          leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(leafletCSS)
        }

        // Load Leaflet JS
        if (!window.L) {
          await new Promise((resolve) => {
            const script = document.createElement("script")
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
            script.onload = resolve
            document.head.appendChild(script)
          })
        }

        if (mapRef.current && window.L && !mapInstanceRef.current) {
          // Initialize map centered on Libya
          const map = window.L.map(mapRef.current).setView([32.7, 13.2], 8)

          // Add satellite tile layer (Esri World Imagery)
          window.L.tileLayer(
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            {
              attribution:
                '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
              maxZoom: 18,
            },
          ).addTo(map)

          // Add street overlay option
          const streetLayer = window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            opacity: 0,
          }).addTo(map)

          // Layer control
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

          // Add company headquarters marker
          const companyIcon = window.L.divIcon({
            html: `<div class="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full border-3 border-white shadow-xl flex items-center justify-center animate-bounce">
                     <span class="text-black font-bold text-lg">ف</span>
                   </div>`,
            className: "custom-div-icon",
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          })

          window.L.marker([32.8872, 13.1913], { icon: companyIcon })
            .addTo(map)
            .bindPopup(`
              <div class="text-center p-2">
                <h3 class="font-bold text-lg text-yellow-600">مقر الفارس الذهبي</h3>
                <p class="text-gray-600">للدعاية والإعلان</p>
                <button onclick="window.open('https://www.google.com/maps?q=32.8872,13.1913', '_blank')" 
                        class="mt-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold hover:bg-yellow-600">
                  فتح في خرائط جوجل
                </button>
              </div>
            `)

          mapInstanceRef.current = map

          // Add billboard markers
          addBillboardMarkers(map, filteredBillboards.slice(0, 50))
        }
      }

      initializeMap()
    }
  }, [showMap])

  const addBillboardMarkers = (map: any, billboardsToShow: Billboard[]) => {
    if (!map || !window.L) return

    // Clear existing billboard markers (keep company marker)
    map.eachLayer((layer: any) => {
      if (layer.options && layer.options.billboardId) {
        map.removeLayer(layer)
      }
    })

    billboardsToShow.forEach((billboard) => {
      const coords = billboard.coordinates.split(",").map((coord) => Number.parseFloat(coord.trim()))
      if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) return

      const [lat, lng] = coords

      // Create custom marker icon
      const billboardIcon = window.L.divIcon({
        html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg hover:scale-150 transition-all duration-300 animate-pulse cursor-pointer">
                 <div class="w-full h-full bg-red-600 rounded-full flex items-center justify-center">
                   <div class="w-2 h-2 bg-white rounded-full"></div>
                 </div>
               </div>`,
        className: "custom-billboard-icon",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = window.L.marker([lat, lng], {
        icon: billboardIcon,
        billboardId: billboard.id,
      }).addTo(map)

      // Create popup content
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
      addBillboardMarkers(mapInstanceRef.current, filteredBillboards.slice(0, 50))
    }
  }, [filteredBillboards, showMap])

  useEffect(() => {
    const loadExcelData = async () => {
      try {
        console.log("[v0] بدء تحميل البيانات من ملف الإكسل...")
        setLoading(true)

        const response = await fetch("/api/billboards")

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        console.log("[v0] تم تحميل البيانات من الإكسل بنجاح، عدد اللوحات:", data.billboards.length)
        setBillboards(data.billboards)
        setFilteredBillboards(data.billboards.slice(0, 3))
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
            size: "12X4",
            level: "B",
            status: "متاح",
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
            size: "12X4",
            level: "A",
            status: "متاح",
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
            size: "12X4",
            level: "B",
            status: "متاح",
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
            size: "12x4",
            level: "A",
            status: "متاح",
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
            size: "12X4",
            level: "B",
            status: "متاح",
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
            size: "12X4",
            level: "B",
            status: "متاح",
            coordinates: "32.498982,14.446801",
            imageUrl: "https://lh3.googleusercontent.com/d/1_js8MPBTvM_ymwPNm1oedZfjtDuMPIfj",
            gpsLink: "https://www.google.com/maps?q=32.498982,14.446801",
          },
        ]

        console.log("[v0] تم استخدام البيانات الاحتياطية، عدد اللوحات:", fallbackData.length)
        setBillboards(fallbackData)
        setFilteredBillboards(fallbackData.slice(0, 3))
        setLoading(false)
      }
    }

    loadExcelData()
  }, [])

  useEffect(() => {
    let filtered = billboards

    if (searchTerm) {
      filtered = filtered.filter(
        (billboard) =>
          billboard.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billboard.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billboard.municipality.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (selectedMunicipality !== "all") {
      filtered = filtered.filter((billboard) => billboard.municipality === selectedMunicipality)
    }

    if (selectedSize !== "all") {
      filtered = filtered.filter((billboard) => billboard.size === selectedSize)
    }

    if (!showAllBillboards) {
      filtered = filtered.slice(0, 3)
      setCurrentPage(1)
    }

    setFilteredBillboards(filtered)
  }, [searchTerm, selectedMunicipality, selectedSize, billboards, showAllBillboards])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30 animate-pulse mb-6">
            <span className="text-black font-bold text-3xl">ف</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">جاري تحميل البيانات...</h2>
          <p className="text-gray-600">يتم قراءة ملف الإكسل</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 relative overflow-hidden">
      {/* الشعار كخلفية */}
      <div className="fixed top-1/2 right-8 transform -translate-y-1/2 opacity-10 pointer-events-none z-0">
        <svg width="300" height="300" viewBox="0 0 300 300" className="text-yellow-600">
          <circle cx="150" cy="150" r="120" fill="currentColor" />
          <text x="150" y="170" textAnchor="middle" className="text-6xl font-bold fill-white">
            ف
          </text>
          <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="4" />
          <text x="150" y="220" textAnchor="middle" className="text-lg font-bold fill-current">
            الفارس الذهبي
          </text>
        </svg>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-black text-white shadow-2xl border-b-4 border-yellow-500 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 rtl:space-x-reverse">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg ring-4 ring-yellow-400/30">
                  <span className="text-black font-bold text-2xl">ف</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-right">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  الفارس الذهبي
                </h1>
                <p className="text-lg text-yellow-300 font-medium">للدعاية والإعلان</p>
                <p className="text-sm text-gray-300">رؤيتك... إبداعنا</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
              احجز موقعك الآن
            </Button>
          </div>
        </div>
      </header>

      {!showAllBillboards && (
        <>
          {/* Hero Section - Company Introduction */}
          <section className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black py-16 relative z-10">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">الرائدون في عالم الدعاية والإعلان</h2>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto leading-relaxed">
                نحن في الفارس الذهبي نقدم حلول إعلانية متكاملة ومبتكرة تضمن وصول رسالتك إلى الجمهور المناسب في الوقت
                المناسب
              </p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <Award className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="text-2xl font-bold mb-2">+15</h3>
                  <p className="text-lg">سنة خبرة</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <Users className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="text-2xl font-bold mb-2">+500</h3>
                  <p className="text-lg">عميل راضي</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="text-2xl font-bold mb-2">{billboards.length}+</h3>
                  <p className="text-lg">موقع إعلاني</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                  <Star className="w-12 h-12 mx-auto mb-4 text-black" />
                  <h3 className="text-2xl font-bold mb-2">100%</h3>
                  <p className="text-lg">جودة مضمونة</p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 relative z-10">
        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">اللوحات الإعلانية المتاحة</h2>
            <p className="text-lg text-gray-600">اختر الموقع المثالي لإعلانك من مجموعتنا المتنوعة</p>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <Input
              type="text"
              placeholder="ابحث عن اللوحات (الاسم، الموقع، البلدية)"
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
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setShowMap(!showMap)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <MapPin className="w-5 h-5 ml-2" />
                {showMap ? "إخفاء الخريطة" : "عرض الخريطة"}
              </Button>

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
                  <h3 className="text-2xl font-bold text-center">
                    خريطة المواقع الإعلانية التفاعلية - صور الأقمار الصناعية
                  </h3>
                  <p className="text-center mt-2 text-sm">
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

        {/* Results Count and Show All Button */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-gray-600 text-lg">
            عرض <span className="font-bold text-yellow-600">{paginatedBillboards.length}</span> من أصل{" "}
            <span className="font-bold text-yellow-600">{filteredBillboards.length}</span> لوحة متاحة
          </p>

          {!showAllBillboards && billboards.length > 3 && (
            <Button
              onClick={() => setShowAllBillboards(true)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
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
              className="border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 font-semibold px-6 py-3 rounded-full"
            >
              عرض أقل
            </Button>
          )}
        </div>

        {/* Billboards Grid/List */}
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
                  src={billboard.imageUrl || "/placeholder.svg?height=300&width=400&query=billboard"}
                  alt={billboard.name}
                  className="w-full h-64 object-cover"
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

              <CardContent className="p-6">
                <div className="text-right space-y-6">
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-2xl font-bold text-gray-900 leading-tight tracking-tight">{billboard.name}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start text-gray-700 justify-end">
                      <div className="text-right">
                        <p className="text-lg font-medium leading-relaxed">{billboard.location}</p>
                        <p className="text-sm text-gray-500 mt-1">{billboard.city}</p>
                      </div>
                      <MapPin className="w-5 h-5 text-yellow-500 mr-3 mt-1 flex-shrink-0" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 py-2">
                    <Badge className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-4 py-2 rounded-full font-semibold text-sm">
                      {billboard.municipality}
                    </Badge>
                    <Badge
                      className={`border px-4 py-2 rounded-full font-semibold text-sm ${
                        billboard.status === "متاح"
                          ? "bg-green-50 text-green-800 border-green-200"
                          : "bg-red-50 text-red-800 border-red-200"
                      }`}
                    >
                      {billboard.status}
                    </Badge>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 rounded-xl shadow-lg transform hover:scale-[1.02] transition-all duration-300 text-lg"
                      onClick={() => window.open(billboard.gpsLink, "_blank")}
                    >
                      <MapPin className="w-5 h-5 ml-2" />
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
            <p className="text-gray-500 text-xl mb-4">لا توجد لوحات تطابق معايير البحث</p>
            <p className="text-gray-400">جرب تغيير معايير البحث أو الفلاتر</p>
          </div>
        )}
      </main>

      {/* Image Modal */}
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
            {/* معلومات الشركة */}
            <div>
              <div className="flex items-center justify-center md:justify-start mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center ml-4">
                  <span className="text-black font-bold text-xl">ف</span>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  الفارس الذهبي
                </h3>
              </div>
              <p className="text-gray-300 text-lg mb-4">للدعاية والإعلان</p>
              <p className="text-gray-400">شريكك المثالي في عالم الدعاية والإعلان</p>
            </div>

            <div>
              <h4 className="text-xl font-bold text-yellow-400 mb-6">تواصل معنا</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-5 h-5 text-yellow-400 ml-3" />
                  <a
                    href="tel:+218912345678"
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 hover:underline"
                  >
                    +218 91 234 5678
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-5 h-5 text-yellow-400 ml-3" />
                  <a
                    href="tel:+218211234567"
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 hover:underline"
                  >
                    +218 21 123 4567
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <MessageCircle className="w-5 h-5 text-green-400 ml-3" />
                  <a
                    href="https://wa.me/218912345678?text=مرحباً، أريد الاستفسار عن اللوحات الإعلانية المتاحة"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-green-400 transition-colors duration-300 hover:underline"
                  >
                    واتساب: +218 91 234 5678
                  </a>
                </div>
              </div>
            </div>

            {/* الموقع */}
            <div>
              <h4 className="text-xl font-bold text-yellow-400 mb-6">موقعنا</h4>
              <div className="space-y-4">
                <p className="text-gray-300">طرابلس - ليبيا</p>
                <p className="text-gray-300">شارع الجمهورية</p>
                <Button
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-6 py-2 rounded-full transform hover:scale-105 transition-all duration-300"
                  onClick={() => window.open("https://www.google.com/maps?q=32.8872,13.1913", "_blank")}
                >
                  <MapPin className="w-4 h-4 ml-2" />
                  عرض على الخريطة
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 الفارس الذهبي للدعاية والإعلان - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
