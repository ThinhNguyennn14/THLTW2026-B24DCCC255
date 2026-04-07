import { useEffect, useMemo, useState } from 'react';

export interface Destination {
  id: string;
  name: string;
  description: string;
  type: 'beach' | 'mountain' | 'city';
  image: string;
  location: string;
  rating: number;
  visitDuration: number;
  costs: {
    dining: number;
    accommodation: number;
    transport: number;
  };
}

export interface ItineraryDay {
  day: number;
  destinations: Destination[];
  savedAt: string;
}

interface AddToDayResult {
  ok: boolean;
  message: string;
}

interface DayActionResult {
  ok: boolean;
  message: string;
}

interface AdminMonthlyStat {
  month: string;
  itineraries: number;
  revenue: number;
}

interface SalesRecord {
  month: string;
  itineraries: number;
  revenue: number;
}

type MoveDirection = 'up' | 'down';

export interface TravelFilters {
  type: '' | Destination['type'];
  priceRange: [number, number];
  rating: number;
}

export type DestinationInput = Omit<Destination, 'id'>;

const initialDestinations: Destination[] = [
  {
    id: 'hlb',
    name: 'Vịnh Hạ Long',
    description: 'Di sản thiên nhiên thế giới với hàng nghìn đảo đá vôi và hang động kỳ thú.',
    type: 'beach',
    image: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80',
    location: 'Quảng Ninh',
    rating: 5,
    visitDuration: 8,
    costs: { dining: 45, accommodation: 120, transport: 35 },
  },
  {
    id: 'sapa',
    name: 'Sa Pa',
    description: 'Không khí mát lạnh quanh năm, ruộng bậc thang và những bản làng vùng cao yên bình.',
    type: 'mountain',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    location: 'Lào Cai',
    rating: 4,
    visitDuration: 10,
    costs: { dining: 35, accommodation: 90, transport: 55 },
  },
  {
    id: 'dalat',
    name: 'Đà Lạt',
    description: 'Thành phố ngàn hoa với khí hậu ôn hòa, phù hợp nghỉ dưỡng và khám phá ẩm thực.',
    type: 'city',
    image: 'https://images.unsplash.com/photo-1543906965-f9520aa2f0c8?auto=format&fit=crop&w=1200&q=80',
    location: 'Lâm Đồng',
    rating: 5,
    visitDuration: 7,
    costs: { dining: 30, accommodation: 80, transport: 40 },
  },
  {
    id: 'phuquoc',
    name: 'Phú Quốc',
    description: 'Thiên đường biển đảo với bãi cát trắng, nước trong xanh và nhiều khu nghỉ dưỡng cao cấp.',
    type: 'beach',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    location: 'Kiên Giang',
    rating: 5,
    visitDuration: 9,
    costs: { dining: 50, accommodation: 150, transport: 60 },
  },
  {
    id: 'danang',
    name: 'Đà Nẵng',
    description: 'Thành phố đáng sống với biển đẹp, cầu biểu tượng và kết nối thuận tiện.',
    type: 'city',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80',
    location: 'Đà Nẵng',
    rating: 4,
    visitDuration: 6,
    costs: { dining: 40, accommodation: 70, transport: 25 },
  },
  {
    id: 'muicangchai',
    name: 'Mù Cang Chải',
    description: 'Ruộng bậc thang hùng vĩ, phù hợp chuyến đi trải nghiệm thiên nhiên và văn hóa.',
    type: 'mountain',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    location: 'Yên Bái',
    rating: 4,
    visitDuration: 8,
    costs: { dining: 28, accommodation: 60, transport: 45 },
  },
];

function createEmptyDay(day: number): ItineraryDay {
  return { day, destinations: [], savedAt: new Date().toISOString() };
}

const STORAGE_KEY = 'travel-app-state-v1';

type TravelStorageState = {
  destinations: Destination[];
  itinerary: ItineraryDay[];
  salesHistory: SalesRecord[];
};

const getDefaultTravelState = (): TravelStorageState => ({
  destinations: initialDestinations,
  itinerary: [createEmptyDay(1), createEmptyDay(2)],
  salesHistory: [],
});

const loadTravelState = (): TravelStorageState => {
  if (typeof window === 'undefined') {
    return getDefaultTravelState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return getDefaultTravelState();
    }

    const parsed = JSON.parse(raw) as Partial<TravelStorageState>;
    return {
      destinations: Array.isArray(parsed.destinations) && parsed.destinations.length > 0 ? parsed.destinations : initialDestinations,
      itinerary:
        Array.isArray(parsed.itinerary) && parsed.itinerary.length > 0
          ? parsed.itinerary.map(day => ({
              day: day.day,
              destinations: Array.isArray(day.destinations) ? day.destinations : [],
              savedAt: day.savedAt || new Date().toISOString(),
            }))
          : [createEmptyDay(1), createEmptyDay(2)],
      salesHistory: Array.isArray(parsed.salesHistory) ? parsed.salesHistory : [],
    };
  } catch {
    return getDefaultTravelState();
  }
};

const persistTravelState = (state: TravelStorageState) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const updateDayTimestamp = (day: ItineraryDay) => ({
  ...day,
  savedAt: new Date().toISOString(),
});
const DAY_HOURS_LIMIT = 24;

const getDayTotalTime = (day: ItineraryDay) => {
  const visitTime = day.destinations.reduce((sum, destination) => sum + destination.visitDuration, 0);
  const transferTime = Math.max(0, day.destinations.length - 1);
  return visitTime + transferTime;
};

const cloneDestination = (destination: Destination): Destination => ({
  ...destination,
  costs: { ...destination.costs },
});

export const useTravelLogic = () => {
  const initialState = useMemo(() => loadTravelState(), []);
  const [destinations, setDestinations] = useState<Destination[]>(initialState.destinations);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(initialState.itinerary);
  const [salesHistory, setSalesHistory] = useState<SalesRecord[]>(initialState.salesHistory);
  const [filters, setFiltersState] = useState<TravelFilters>({ type: '', priceRange: [0, 500], rating: 0 });

  useEffect(() => {
    persistTravelState({ destinations, itinerary, salesHistory });
  }, [destinations, itinerary, salesHistory]);

  const setFilters = (nextFilters: Partial<TravelFilters>) => {
    setFiltersState(prev => ({ ...prev, ...nextFilters }));
  };

  const filteredData = useMemo(() => {
    return destinations.filter(destination => {
      const totalPrice = destination.costs.dining + destination.costs.accommodation + destination.costs.transport;

      return (
        (filters.type === '' || destination.type === filters.type) &&
        totalPrice >= filters.priceRange[0] &&
        totalPrice <= filters.priceRange[1] &&
        destination.rating >= filters.rating
      );
    });
  }, [destinations, filters]);

  const addToDay = (dayNum: number, destination: Destination): AddToDayResult => {
    const day = itinerary.find(item => item.day === dayNum) || createEmptyDay(dayNum);

    if (day.destinations.some(item => item.id === destination.id)) {
      return { ok: false, message: 'Điểm đến này đã có trong ngày đã chọn' };
    }

    const nextTotalTime =
      getDayTotalTime(day) + destination.visitDuration + (day.destinations.length > 0 ? 1 : 0);

    if (nextTotalTime > DAY_HOURS_LIMIT) {
      return {
        ok: false,
        message: `Không thể thêm: tổng thời gian ngày ${dayNum} sẽ là ${nextTotalTime}h (vượt 24h)`,
      };
    }

    setItinerary(prev => {
      const hasDay = prev.some(day => day.day === dayNum);
      const nextDays = hasDay ? prev : [...prev, createEmptyDay(dayNum)];

      return nextDays.map(day => {
        if (day.day !== dayNum) {
          return day;
        }

        if (day.destinations.some(item => item.id === destination.id)) {
          return day;
        }

        return {
          ...day,
          destinations: [...day.destinations, cloneDestination(destination)],
          savedAt: new Date().toISOString(),
        };
      });
    });

    return { ok: true, message: `Đã thêm ${destination.name} vào ngày ${dayNum}` };
  };

  const addDay = (): DayActionResult => {
    const nextDay = itinerary.length > 0 ? Math.max(...itinerary.map(day => day.day)) + 1 : 1;
    setItinerary(prev => [...prev, createEmptyDay(nextDay)]);
    return { ok: true, message: `Đã thêm ngày ${nextDay}` };
  };

  const removeDay = (dayNum: number): DayActionResult => {
    if (itinerary.length <= 1) {
      return { ok: false, message: 'Cần giữ lại ít nhất 1 ngày trong lịch trình' };
    }

    const exists = itinerary.some(day => day.day === dayNum);
    if (!exists) {
      return { ok: false, message: `Không tìm thấy ngày ${dayNum}` };
    }

    setItinerary(prev => prev.filter(day => day.day !== dayNum));
    return { ok: true, message: `Đã xóa ngày ${dayNum}` };
  };

  const resetTrip = (): DayActionResult => {
    const revenue = stats.grandTotal;
    const itineraries = itinerary.filter(day => day.destinations.length > 0).length;
    const createdAt = new Date();
    const month = `${createdAt.getMonth() + 1}/${String(createdAt.getFullYear()).slice(-2)}`;

    if (revenue > 0 || itineraries > 0) {
      setSalesHistory(prev => [
        ...prev,
        {
          month,
          itineraries,
          revenue: Number(revenue.toFixed(2)),
        },
      ]);
    }

    setItinerary([createEmptyDay(1), createEmptyDay(2)]);
    return { ok: true, message: 'Đã chốt đơn và làm mới lịch trình cho khách tiếp theo' };
  };

  const removeDest = (dayNum: number, destId: string) => {
    setItinerary(prev =>
      prev.map(day =>
        day.day === dayNum
          ? updateDayTimestamp({ ...day, destinations: day.destinations.filter(item => item.id !== destId) })
          : day,
      ),
    );
  };

  const moveDest = (dayNum: number, destId: string, direction: MoveDirection) => {
    setItinerary(prev =>
      prev.map(day => {
        if (day.day !== dayNum) {
          return day;
        }

        const currentIndex = day.destinations.findIndex(item => item.id === destId);
        if (currentIndex < 0) {
          return day;
        }

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= day.destinations.length) {
          return day;
        }

        const nextDestinations = [...day.destinations];
        const [moved] = nextDestinations.splice(currentIndex, 1);
        nextDestinations.splice(targetIndex, 0, moved);

        return updateDayTimestamp({ ...day, destinations: nextDestinations });
      }),
    );
  };

  const addDestination = (destination: DestinationInput) => {
    setDestinations(prev => [
      ...prev,
      {
        ...destination,
        id: `dest-${Date.now()}`,
        costs: { ...destination.costs },
      },
    ]);
  };

  const updateDestination = (id: string, destination: DestinationInput) => {
    setDestinations(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              ...destination,
              id,
              costs: { ...destination.costs },
            }
          : item,
      ),
    );
  };

  const deleteDestination = (id: string) => {
    setDestinations(prev => prev.filter(item => item.id !== id));
    setItinerary(prev =>
      prev.map(day => updateDayTimestamp({ ...day, destinations: day.destinations.filter(item => item.id !== id) })),
    );
  };

  const stats = useMemo(() => {
    const totals = { dining: 0, transport: 0, accommodation: 0, visitTime: 0, transferTime: 0, time: 0 };

    itinerary.forEach(day => {
      totals.transferTime += Math.max(0, day.destinations.length - 1);

      day.destinations.forEach(destination => {
        totals.dining += destination.costs.dining;
        totals.transport += destination.costs.transport;
        totals.accommodation += destination.costs.accommodation;
        totals.visitTime += destination.visitDuration;
      });
    });

    totals.time = totals.visitTime + totals.transferTime;

    const grandTotal = totals.dining + totals.transport + totals.accommodation;
    return { ...totals, grandTotal, isOver: grandTotal > 10000 };
  }, [itinerary]);

  const adminStats = useMemo(
    () => {
      const monthMap = new Map<string, { itineraries: number; revenue: number }>();

      salesHistory.forEach(record => {
        const current = monthMap.get(record.month) || { itineraries: 0, revenue: 0 };
        monthMap.set(record.month, {
          itineraries: current.itineraries + record.itineraries,
          revenue: Number((current.revenue + record.revenue).toFixed(2)),
        });
      });

      itinerary.forEach(day => {
        const savedAt = day.savedAt ? new Date(day.savedAt) : new Date();
        const monthLabel = `${savedAt.getMonth() + 1}/${String(savedAt.getFullYear()).slice(-2)}`;
        const dayRevenue = day.destinations.reduce(
          (sum, destination) => sum + destination.costs.dining + destination.costs.transport + destination.costs.accommodation,
          0,
        );

        const current = monthMap.get(monthLabel) || { itineraries: 0, revenue: 0 };
        monthMap.set(monthLabel, {
          itineraries: current.itineraries + 1,
          revenue: Number((current.revenue + dayRevenue).toFixed(2)),
        });
      });

      const sortedMonths = [...monthMap.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, value]) => ({ month, ...value }));

      const byMonth: AdminMonthlyStat[] = sortedMonths.length > 0 ? sortedMonths : [{ month: '0/00', itineraries: 0, revenue: 0 }];

      const topCategory =
        [
          { category: 'Ăn uống', value: stats.dining },
          { category: 'Di chuyển', value: stats.transport },
          { category: 'Lưu trú', value: stats.accommodation },
        ].sort((a, b) => b.value - a.value)[0]?.category || 'Chưa có';

      return {
        byMonth,
        topCategory,
        popular: [...destinations].sort((a, b) => b.rating - a.rating).slice(0, 3),
        revenue: byMonth.reduce((sum, item) => sum + item.revenue, 0),
      };
    },
    [destinations, itinerary, salesHistory, stats.accommodation, stats.dining, stats.transport],
  );

  return {
    destinations,
    filteredData,
    itinerary,
    filters,
    setFilters,
    addToDay,
    addDay,
    removeDay,
    resetTrip,
    removeDest,
    moveDest,
    stats,
    adminStats,
    setDestinations,
    addDestination,
    updateDestination,
    deleteDestination,
  };
};