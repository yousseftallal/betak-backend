
import React, { useEffect, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import { analyticsService } from '../services/analyticsService';
import { Globe, RefreshCw, ZoomIn, ZoomOut, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function GeographicPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });

    const getData = async () => {
        try {
            setLoading(true);
            const response = await analyticsService.getDemographics(999); // Get all
            setData(response.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load map data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const handleZoomIn = () => {
        if (position.zoom >= 4) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.2 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.2 }));
    };

    const handleMoveEnd = (position) => {
        setPosition(position);
    };

    // Prepare heatmap scale
    const maxValue = Math.max(...data.map(d => d.value), 10);
    const colorScale = scaleLinear()
        .domain([0, 1, maxValue / 2, maxValue])
        .range(["#F1F5F9", "#BFDBFE", "#3B82F6", "#1E40AF"]);

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-500" />
                        Geographic Analysis
                    </h1>
                    <p className="text-sm text-slate-500">Real-time user distribution across the globe.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                        <button onClick={handleZoomOut} className="p-2 text-slate-600 hover:bg-slate-50 border-r border-slate-200">
                            <Minus className="w-4 h-4" />
                        </button>
                        <button onClick={handleZoomIn} className="p-2 text-slate-600 hover:bg-slate-50">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                    <button onClick={getData} className="p-2 bg-white text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 shadow-sm">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 overflow-hidden relative">
                <div className="h-[600px] w-full bg-slate-50 rounded-lg border border-slate-100 relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                                <span className="text-sm text-slate-500 font-medium">Loading Map Data...</span>
                            </div>
                        </div>
                    )}

                    <ComposableMap projectionConfig={{ scale: 190 }} width={900} height={500} style={{ width: "100%", height: "100%" }}>
                        <ZoomableGroup
                            zoom={position.zoom}
                            center={position.coordinates}
                            onMoveEnd={handleMoveEnd}
                            maxZoom={4}
                        >
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const countryName = geo.properties.name;
                                        // Improved fuzzy matching
                                        const countryData = data.find(d => {
                                            const dbName = d.name?.toLowerCase();
                                            const mapName = countryName?.toLowerCase();
                                            return dbName === mapName ||
                                                (dbName === 'usa' && mapName === 'united states of america') ||
                                                (dbName === 'united states' && mapName === 'united states of america') ||
                                                (dbName === 'uae' && mapName === 'united arab emirates') ||
                                                (dbName === 'uk' && mapName === 'united kingdom');
                                        });

                                        const value = countryData ? countryData.value : 0;

                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                fill={value > 0 ? colorScale(value) : "#F8FAFC"}
                                                stroke="#E2E8F0"
                                                strokeWidth={0.5}
                                                style={{
                                                    default: { outline: "none", transition: "all 0.3s" },
                                                    hover: { fill: "#F59E0B", outline: "none", cursor: 'pointer', stroke: '#F59E0B', zIndex: 10 },
                                                    pressed: { outline: "none" }
                                                }}
                                                data-tooltip-id="my-tooltip"
                                                data-tooltip-content={`${countryName}: ${value} users`}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ZoomableGroup>
                    </ComposableMap>

                    <Tooltip id="my-tooltip" style={{ backgroundColor: "#1e293b", color: "#fff", borderRadius: "8px", fontSize: "14px", padding: "8px 12px" }} />
                </div>

                {/* Legend */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3">Top Countries</h3>
                    <div className="flex flex-wrap gap-4">
                        {data.length > 0 ? data.slice(0, 8).map((d, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 min-w-[120px]">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorScale(d.value) }}></div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-slate-700 text-xs truncate max-w-[100px]">{d.name}</span>
                                    <span className="text-xs text-slate-400 font-mono">{d.value.toLocaleString()} users</span>
                                </div>
                            </div>
                        )) : (
                            <div className="text-sm text-slate-400 italic">No geographic data available yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
