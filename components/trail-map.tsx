"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface Location {
  id: string
  name: string
  slug: string
  description: string | null
  latitude: number
  longitude: number
  order_number: number
}

export function TrailMap({ locations }: { locations: Location[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const center: [number, number] =
      locations.length > 0
        ? [locations[0].latitude, locations[0].longitude]
        : [51.585, 5.056]

    const map = L.map(mapRef.current, {
      center,
      zoom: 15,
      zoomControl: true,
    })

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)

    // Custom marker icon
    const markerIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: 32px;
        height: 32px;
        background: hsl(30, 45%, 30%);
        border: 3px solid hsl(40, 30%, 96%);
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "><div style="
        transform: rotate(45deg);
        text-align: center;
        line-height: 26px;
        font-size: 12px;
        font-weight: bold;
        color: hsl(40, 30%, 96%);
      "></div></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })

    // Add markers
    const coords: [number, number][] = []
    locations.forEach((loc) => {
      const pos: [number, number] = [loc.latitude, loc.longitude]
      coords.push(pos)

      const marker = L.marker(pos, { icon: markerIcon }).addTo(map)
      marker.bindPopup(
        `<div style="font-family: serif; min-width: 160px;">
          <strong style="font-size: 14px;">${loc.order_number}. ${loc.name}</strong>
          <p style="margin: 6px 0; font-size: 12px; color: #666;">${loc.description || ""}</p>
          <a href="/locaties/${loc.slug}" style="color: hsl(30, 45%, 30%); font-size: 12px; font-weight: bold;">Meer info &rarr;</a>
        </div>`
      )
    })

    // Draw trail line
    if (coords.length > 1) {
      L.polyline(coords, {
        color: "hsl(140, 20%, 35%)",
        weight: 3,
        opacity: 0.8,
        dashArray: "8 6",
      }).addTo(map)
    }

    // Fit bounds
    if (coords.length > 1) {
      map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] })
    }

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [locations])

  return <div ref={mapRef} className="h-full w-full" />
}
