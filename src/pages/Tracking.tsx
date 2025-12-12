import React, { useState } from "react";
import { BoxRegular } from "@fluentui/react-icons";

const Tracking: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [trackingData, setTrackingData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrackingData(null);

    // TODO: Implement actual tracking API call
    // For now, this is a placeholder
    try {
      if (!trackingNumber.trim()) {
        setError("Please enter a tracking number");
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This is placeholder data - replace with actual API response
      setTrackingData({
        trackingNumber: trackingNumber,
        status: "In Transit",
        estimatedDelivery: "Dec 15, 2025",
        currentLocation: "Distribution Center, New York",
        events: [
          {
            date: "Dec 12, 2025 - 2:30 PM",
            status: "In Transit",
            location: "Distribution Center, New York",
            description: "Your package is on its way",
          },
          {
            date: "Dec 12, 2025 - 10:15 AM",
            status: "Picked Up",
            location: "Warehouse, California",
            description: "Your package has been picked up",
          },
          {
            date: "Dec 11, 2025 - 4:45 PM",
            status: "Order Confirmed",
            location: "Warehouse, California",
            description: "Order confirmed and ready for shipment",
          },
        ],
      });
    } catch (err) {
      setError("Failed to track package. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="flex justify-center mb-4">
              <BoxRegular className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-4xl font-light text-black mb-2 tracking-wide">TRACK YOUR PARCEL</h1>
            <p className="text-gray-600 font-light text-sm">Enter your tracking number to see the status of your order</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="mb-12">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter tracking number..."
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-black transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-black text-white text-sm uppercase tracking-wide font-light hover:bg-gray-800 disabled:bg-gray-600 transition-colors"
              >
                {loading ? "Searching..." : "Track"}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 font-light text-sm">{error}</p>
            </div>
          )}

          {/* Tracking Details */}
          {trackingData && (
            <div className="space-y-8">
              {/* Status Summary */}
              <div className="bg-gray-50 p-6 rounded border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-gray-600 font-light text-xs uppercase tracking-wide mb-2">Status</p>
                    <p className="text-lg font-light text-black">{trackingData.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-light text-xs uppercase tracking-wide mb-2">Current Location</p>
                    <p className="text-lg font-light text-black">{trackingData.currentLocation}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-light text-xs uppercase tracking-wide mb-2">Estimated Delivery</p>
                    <p className="text-lg font-light text-black">{trackingData.estimatedDelivery}</p>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-sm font-light uppercase tracking-wide text-black mb-6">Tracking History</h3>
                <div className="space-y-6">
                  {trackingData.events.map((event: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                        {index < trackingData.events.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-xs text-gray-600 font-light">{event.date}</p>
                        <p className="text-sm font-light text-black mt-1">{event.status}</p>
                        <p className="text-xs text-gray-600 font-light mt-1">{event.location}</p>
                        <p className="text-sm text-gray-700 font-light mt-2">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!trackingData && !error && (
            <div className="text-center py-12">
              <BoxRegular className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-light text-sm">Enter a tracking number to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;
