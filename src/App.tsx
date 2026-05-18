import { motion } from "motion/react";
import { Film, User, Search, MapPin, Calendar, Star, Info, ChevronRight, X, User as UserIcon, Ticket } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { cn } from "./lib/utils";

// --- Types ---
interface Movie {
  id: string;
  title: string;
  image: string;
  trailer: string;
  rating: number;
  duration: string;
  genre: string;
  description: string;
  showtimes: string[];
}

interface Recommendation {
  title: string;
  description: string;
  reason: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface News { id: string, title: string, category: string, date: string }
interface Promotion { id: string, title: string, code: string }
interface BookingRecord { id: string, movieTitle: string, time: string, date: string, seats: string[], price: number, createdAt: string }

// --- Components ---

const Navbar = ({ user, onLogout, onOpenAuth, onOpenHistory }: { user: UserProfile | null, onLogout: () => void, onOpenAuth: () => void, onOpenHistory: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10 px-6 py-4">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Film className="w-8 h-8 text-orange-500" />
        <span className="text-2xl font-bold tracking-tighter text-white">CINE<span className="text-orange-500">BOOKING</span></span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <a href="#movies" className="text-white hover:text-orange-500 transition-colors">Phim Đang Chiếu</a>
        <a href="#news" className="hover:text-orange-500 transition-colors">Tin Tức</a>
        <a href="#promos" className="hover:text-orange-500 transition-colors">Ưu Đãi</a>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpenHistory}
              className="text-xs text-white/60 hover:text-orange-500 flex items-center gap-1"
            >
              <Ticket className="w-4 h-4" />
              Vé của tôi
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-white">{user.name}</span>
            </div>
            <button onClick={onLogout} className="text-xs text-white/40 hover:text-white transition-colors">
              Đăng xuất
            </button>
          </div>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-full transition-all"
          >
            <UserIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Đăng nhập</span>
          </button>
        )}
      </div>
    </div>
  </nav>
);

const MovieCard = ({ movie, onClick, onWatchTrailer }: { movie: Movie; onClick: () => void; onWatchTrailer: (url: string) => void, key?: string }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="relative group cursor-pointer aspect-[2/3] rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/5"
    onClick={onClick}
  >
    <img src={movie.image} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-6 flex flex-col justify-end translate-y-2 group-hover:translate-y-0 transition-transform">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="text-white text-sm font-medium">{movie.rating}</span>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onWatchTrailer(movie.trailer); }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Film className="w-4 h-4" />
        </button>
      </div>
      <h3 className="text-white font-bold text-xl mb-1 line-clamp-2 leading-tight">{movie.title}</h3>
      <p className="text-white/60 text-xs mb-4">{movie.genre}</p>
      <button className="w-full bg-white text-black py-3 rounded-xl font-bold opacity-0 group-hover:opacity-100 transition-opacity">
        Đặt vé ngay
      </button>
    </div>
  </motion.div>
);

const BookingModal = ({ movie, user, onClose }: { movie: Movie; user: UserProfile | null; onClose: () => void }) => {
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [step, setStep] = useState(1); // 1: Info, 2: Seats, 3: Payment, 4: QR/Confirm, 5: Success
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");

  const dates = Array.from({ length: 5 }, (_, i) => {
    if (i === 0) return "Hôm nay";
    if (i === 1) return "Ngày mai";
    const d = new Date();
    d.setDate(d.getDate() + i);
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    return `${days[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;
  });

  useEffect(() => {
    if (selectedTime) {
      fetch(`/api/bookings/seats?movieTitle=${encodeURIComponent(movie.title)}&date=${encodeURIComponent(dates[selectedDate])}&time=${encodeURIComponent(selectedTime)}`)
        .then(res => res.json())
        .then(setBookedSeats);
    }
  }, [selectedTime, selectedDate, movie.title]);

  const totalPrice = selectedSeats.length * 85000;

  const handleBooking = async () => {
    if (!user) return;
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          movieTitle: movie.title,
          time: selectedTime,
          date: dates[selectedDate],
          seats: selectedSeats,
          price: totalPrice,
          paymentMethod
        })
      });
      setStep(5);
    } catch (e) {
      console.error(e);
    }
  };

  const renderSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const cols = Array.from({ length: 10 }, (_, i) => i + 1);
    return (
      <div className="space-y-4 scale-90 md:scale-100 flex flex-col items-center">
        <div className="w-full max-w-md h-2 bg-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.3)] blur-sm mb-12 rounded-full relative">
           <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white/20 font-bold tracking-[0.3em] uppercase">Màn hình</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          {rows.map(row => (
            <div key={row} className="flex gap-2">
              <span className="w-6 text-[10px] text-white/30 self-center font-bold">{row}</span>
              {cols.map(col => {
                const id = `${row}${col}`;
                const isSelected = selectedSeats.includes(id);
                const isBooked = bookedSeats.includes(id);
                return (
                  <button
                    key={id}
                    disabled={isBooked}
                    onClick={() => setSelectedSeats(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])}
                    className={cn(
                      "w-6 h-6 md:w-8 md:h-8 rounded-t-lg transition-all relative group",
                      isSelected ? "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]" : "bg-white/10 hover:bg-white/20",
                      isBooked && "bg-red-900/40 cursor-not-allowed border border-red-500/20"
                    )}
                  >
                    {isBooked && <X className="w-3 h-3 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="flex gap-6 mt-8 text-[10px] font-bold uppercase tracking-wider text-white/40">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-white/10 rounded-t-sm" />
              <span>Trống</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-t-sm" />
              <span>Đang chọn</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-900/40 border border-red-500/20 rounded-t-sm flex items-center justify-center">
                <X className="w-2 h-2 text-red-500" />
              </div>
              <span>Đã đặt</span>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto"
      >
        <div className="w-full md:w-1/3 h-32 md:h-32 relative md:h-full overflow-hidden shrink-0">
          <img src={movie.image} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
        </div>

        <div className="w-full md:w-2/3 p-6 md:p-10 flex flex-col relative overflow-y-auto">
          <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white"><X className="w-6 h-6" /></button>

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">{movie.title}</h2>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase mb-4">Chọn ngày</p>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {dates.map((date, i) => (
                    <button key={date} onClick={() => setSelectedDate(i)} className={cn("px-5 py-3 rounded-2xl border text-sm shrink-0", selectedDate === i ? "border-orange-500 bg-orange-600" : "border-white/10 text-white/50")}>{date}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-white/40 uppercase mb-4">Chọn giờ chiếu</p>
                <div className="grid grid-cols-4 gap-2">
                  {movie.showtimes.map(time => (
                    <button key={time} onClick={() => setSelectedTime(time)} className={cn("py-3 rounded-xl border font-mono text-sm", selectedTime === time ? "border-orange-500 bg-orange-600" : "border-white/10 text-white/50")}>{time}</button>
                  ))}
                </div>
              </div>
              <button disabled={!selectedTime} onClick={() => setStep(2)} className="w-full bg-white text-black py-4 rounded-xl font-bold disabled:opacity-50">Tiếp tục</button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold mb-8 mr-auto">Chọn chỗ ngồi</h3>
              {renderSeats()}
              <div className="w-full mt-10 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Ghế đã chọn</p>
                  <p className="font-bold text-orange-500">{selectedSeats.join(', ') || 'Chưa chọn'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-right">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Tổng cộng</p>
                  <p className="font-bold tracking-tight">{(selectedSeats.length * 85000).toLocaleString()}đ</p>
                </div>
              </div>
              <div className="flex gap-4 w-full mt-6">
                <button onClick={() => setStep(1)} className="px-6 py-4 border border-white/10 rounded-xl">Quay lại</button>
                <button disabled={selectedSeats.length === 0} onClick={() => setStep(3)} className="flex-1 bg-white text-black py-4 rounded-xl font-bold">Thanh toán</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Phương thức thanh toán</h3>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-white/40">Phim:</span>
                    <span className="font-bold">{movie.title}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-white/40">Suất chiếu:</span>
                    <span className="font-bold">{selectedTime} • {dates[selectedDate]}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-white/40">Ghế:</span>
                    <span className="font-bold text-orange-500">{selectedSeats.join(', ')}</span>
                 </div>
                 <div className="h-px bg-white/10 my-2" />
                 <div className="flex justify-between text-lg">
                    <span className="font-bold">Tổng tiền:</span>
                    <span className="font-bold text-orange-500">{totalPrice.toLocaleString()}đ</span>
                 </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { id: "momo", name: "MoMo (QR)", color: "bg-[#A50064]" },
                  { id: "zalopay", name: "ZaloPay (QR)", color: "bg-[#003C8F]" },
                  { id: "vnpay", name: "VNPay", color: "bg-[#E11D48]" },
                  { id: "card", name: "Thẻ ngân hàng", color: "bg-white/10" }
                ].map(p => (
                  <button key={p.id} onClick={() => setPaymentMethod(p.id)} className={cn("p-4 rounded-2xl flex items-center justify-between border-2 transition-all", paymentMethod === p.id ? "border-orange-500 bg-white/5" : "border-white/5 hover:border-white/20")}>
                    <div className="flex items-center gap-4">
                       <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] text-white", p.color)}>{p.name.charAt(0)}</div>
                       <span className="font-bold">{p.name}</span>
                    </div>
                    {paymentMethod === p.id && <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white">✓</div>}
                  </button>
                ))}
              </div>
              <button disabled={!paymentMethod} onClick={() => setStep(4)} className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold shadow-2xl disabled:opacity-50">Tiếp tục</button>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center text-center space-y-8 py-4">
               <div>
                  <h3 className="text-2xl font-bold mb-2">Thanh toán qua {paymentMethod.toUpperCase()}</h3>
                  <p className="text-white/40 text-sm">Quét mã QR dưới đây để hoàn tất thanh toán</p>
               </div>
               
               <div className="relative p-4 bg-white rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.3)]">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=CINEBOOKING_PAYMENT_${totalPrice}`} 
                    alt="QR Code"
                    className="w-48 h-48 md:w-64 md:h-64"
                  />
                  {(paymentMethod === "momo" || paymentMethod === "zalopay") && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity">
                       <div className="bg-black/80 px-4 py-2 rounded-full text-[10px] font-bold">VUI LÒNG QUÉT MÃ</div>
                    </div>
                  )}
               </div>

               <div className="w-full space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                     <p className="text-xs text-white/40 mb-1">Số tiền cần thanh toán</p>
                     <p className="text-2xl font-bold text-orange-500">{totalPrice.toLocaleString()}đ</p>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => setStep(3)} className="px-6 py-4 border border-white/10 rounded-2xl text-white/60">Quay lại</button>
                     <button onClick={handleBooking} className="flex-1 bg-white text-black py-4 rounded-2xl font-bold shadow-xl">Tôi đã thanh toán</button>
                  </div>
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6"><Ticket className="w-10 h-10" /></div>
              <h2 className="text-3xl font-bold mb-2">Đặt vé thành công!</h2>
              <p className="text-white/50 mb-8">Bạn có thể xem vé trong phần "Lịch sử giao dịch".</p>
              <button onClick={onClose} className="w-full bg-white text-black py-4 rounded-xl font-bold">Đóng</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const HistoryModal = ({ user, onClose }: { user: UserProfile, onClose: () => void }) => {
  const [history, setHistory] = useState<BookingRecord[]>([]);

  useEffect(() => {
    fetch(`/api/bookings/${user.id}`).then(res => res.json()).then(setHistory);
  }, [user.id]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-3xl p-8 max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8">Lịch sử đặt vé</h2>
        <div className="space-y-4">
          {history.length === 0 ? <p className="text-white/40 text-center py-20">Bạn chưa có giao dịch nào.</p> : (
            history.map(b => (
              <div key={b.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg mb-1">{b.movieTitle}</h4>
                  <p className="text-white/40 text-sm">{b.date} • {b.time}</p>
                  <p className="text-white/20 text-[10px] mt-2 uppercase tracking-widest font-bold">Mã: {b.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-orange-500 font-bold">{b.price.toLocaleString()}đ</p>
                  <p className="text-white/40 text-xs">Ghế: {b.seats.join(', ')}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <button onClick={onClose} className="w-full mt-8 py-4 border border-white/10 rounded-xl text-white/60">Đóng</button>
      </motion.div>
    </div>
  );
};

const TrailerModal = ({ url, onClose }: { url: string, onClose: () => void }) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95">
        <button onClick={onClose} className="absolute top-8 right-8 text-white hover:text-orange-500 transition-colors z-20"><X className="w-10 h-10" /></button>
        <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(249,115,22,0.2)]">
            <iframe src={url} className="w-full h-full border-none" allowFullScreen></iframe>
        </div>
    </div>
);

const Recommendations = () => {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: "muốn xem hành động kịch tính" })
      });
      const data = await res.json();
      setRecs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-20 p-8 rounded-[2.5rem] bg-gradient-to-br from-orange-600/20 via-zinc-900 to-zinc-900 border border-white/10 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-500 rounded-lg">
            <Star className="w-5 h-5 text-white" />
          </div>
          <span className="text-orange-500 font-bold uppercase tracking-widest text-sm">Gợi ý từ AI Cine</span>
        </div>
        <h2 className="text-4xl font-bold text-white mb-8">Bạn muốn xem gì hôm nay?</h2>
        
        {recs.length === 0 && !loading && (
          <button 
            onClick={fetchRecs}
            className="px-8 py-4 bg-white text-black rounded-2xl font-bold hover:bg-orange-500 hover:text-white transition-all"
          >
            Nhận gợi ý phim từ AI
          </button>
        )}

        {loading && <div className="text-white/50 animate-pulse font-mono tracking-widest">ĐANG PHÂN TÍCH XU HƯỚNG...</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recs.map((rec, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={rec.title}
              className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-orange-500/50 transition-colors"
            >
              <h4 className="text-orange-500 font-bold text-lg mb-2">{rec.title}</h4>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">{rec.description}</p>
              <div className="flex items-start gap-2 pt-4 border-top border-white/5">
                <Info className="w-4 h-4 text-white/30 flex-shrink-0 mt-1" />
                <p className="text-white/40 text-xs italic">{rec.reason}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
    </div>
  );
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Xin chào! Tôi là CineAI. Bạn cần hỗ trợ tìm phim hay đặt vé không?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatHistory: [...messages, { role: 'user', text: userMsg }] })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'ai', text: "Xin lỗi, tôi gặp sự cố kết nối." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-orange-600 rounded-full shadow-2xl flex items-center justify-center text-white"
      >
        {isOpen ? <X className="w-8 h-8" /> : <Ticket className="w-8 h-8" />}
      </motion.button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-20 right-0 w-80 h-96 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-4 bg-zinc-800 border-b border-white/5 font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            CineAI Trợ Lý
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[80%] p-3 rounded-2xl text-sm",
                  msg.role === 'user' ? "bg-orange-600 text-white" : "bg-white/10 text-white/80"
                )}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-white/30 text-xs italic">CineAI đang soạn tin...</div>}
          </div>
          <div className="p-4 border-t border-white/5 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
            />
            <button onClick={handleSend} className="p-2 bg-orange-600 rounded-xl text-white">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

const AuthModal = ({ onClose, onLoginSuccess }: { onClose: () => void, onLoginSuccess: (user: UserProfile) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { email, password, name };
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra");

      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess(data);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_50px_rgba(249,115,22,0.1)] overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        
        {success ? (
          <div className="py-12 text-center">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.4)]"
             >
                <Ticket className="w-12 h-12 text-white" />
             </motion.div>
             <motion.h2 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="text-4xl font-bold text-white mb-4"
             >
               Tuyệt vời!
             </motion.h2>
             <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.5 }}
               className="text-white/40 font-medium"
             >
               {isLogin ? "Chào mừng bạn đã quay trở lại." : "Tài khoản của bạn đã sẵn sàng."}
             </motion.p>
             <div className="mt-8 flex justify-center gap-1">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
             </div>
          </div>
        ) : (
          <>
            <motion.div variants={itemVariants} className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl rotate-3 group hover:rotate-0 transition-transform">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{isLogin ? "Chào mừng trở lại" : "Tạo tài khoản mới"}</h2>
              <p className="text-white/40 text-sm mt-3 px-4">{isLogin ? "Đăng nhập để đặt vé nhanh chóng và nhận ưu đãi" : "Tham gia hệ thống đặt vé hiện đại nhất Việt Nam"}</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <motion.div variants={itemVariants}>
                  <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 ml-1">Họ tên</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 ml-1">Địa chỉ Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                  placeholder="cine@example.com"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3 ml-1">Mật khẩu</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all"
                  placeholder="••••••••"
                />
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs text-center font-medium"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500 text-white py-5 rounded-2xl font-bold transition-all shadow-[0_10px_30px_rgba(249,115,22,0.3)] disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (isLogin ? "Bắt đầu trải nghiệm" : "Đăng ký thành viên")}
              </motion.button>
            </form>

            <motion.div variants={itemVariants} className="mt-10 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white/30 text-xs font-medium hover:text-orange-500 transition-colors uppercase tracking-widest"
              >
                {isLogin ? "Bạn là người mới? Đăng ký ngay" : "Đã có tài khoản? Quay lại đăng nhập"}
              </button>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};


// --- App ---

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [filteredGenre, setFilteredGenre] = useState("Tất cả");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetch("/api/movies").then(res => res.json()).then(data => { setMovies(data); setLoading(false); });
    fetch("/api/news").then(res => res.json()).then(setNews);
    fetch("/api/promotions").then(res => res.json()).then(setPromos);
    const saved = localStorage.getItem("cine_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLoginSuccess = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem("cine_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cine_user");
  };

  const genres = ["Tất cả", "Hành động", "Khoa học viễn tưởng", "Hoạt hình", "Kinh dị", "Tình cảm"];
  const displayMovies = filteredGenre === "Tất cả" ? movies : movies.filter(m => m.genre === filteredGenre);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white scroll-smooth pb-20">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onOpenAuth={() => setShowAuthModal(true)} 
        onOpenHistory={() => setShowHistoryModal(true)}
      />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {/* Hero Section */}
        <div className="relative rounded-[3rem] overflow-hidden aspect-[21/9] mb-20 shadow-2xl group">
          <img 
            src="https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&q=80&w=1600" 
            className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent p-12 flex flex-col justify-center">
            <h1 className="text-6xl font-bold mb-6 tracking-tight leading-tight uppercase">Trải nghiệm <span className="text-orange-500 italic font-serif lowercase">điện ảnh</span> <br/>vượt mọi giới hạn</h1>
            <p className="text-white/60 max-w-lg mb-10 leading-relaxed">Đặt vé nhanh chóng, chọn chỗ ngồi ưng ý và tận hưởng những thước phim bom tấn trong không gian rạp đẳng cấp quốc tế.</p>
            <div className="flex gap-4">
               <button onClick={() => document.getElementById('movies')?.scrollIntoView()} className="px-8 py-4 bg-orange-600 rounded-2xl font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)]">Đặt vé ngay</button>
               <button onClick={() => setTrailerUrl("https://www.youtube.com/embed/aWzlQ2N6qqg")} className="px-8 py-4 bg-white/10 rounded-2xl font-bold backdrop-blur-md">Trailer hot</button>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div id="movies" className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 scroll-mt-24">
          <h2 className="text-3xl font-bold">Phim đang chiếu</h2>
          <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {genres.map(g => (
              <button 
                key={g} 
                onClick={() => setFilteredGenre(g)} 
                className={cn(
                  "px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all", 
                  filteredGenre === g ? "bg-orange-500 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Movie Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {displayMovies.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onClick={() => setSelectedMovie(movie)} 
              onWatchTrailer={(u) => setTrailerUrl(u)} 
            />
          ))}
        </div>

        <Recommendations />

        {/* News & Promos Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 my-32">
          <section id="news" className="space-y-8 scroll-mt-24">
             <h3 className="text-2xl font-bold flex items-center gap-3"><span className="w-2 h-8 bg-orange-500 rounded-full" />Tin tức điện ảnh</h3>
             <div className="space-y-4">
                {news.map(n => (
                  <div key={n.id} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors flex justify-between items-center group">
                     <div>
                        <span className="text-[10px] uppercase tracking-widest text-orange-500 font-bold mb-1 block">{n.category}</span>
                        <h4 className="font-bold group-hover:text-orange-500">{n.title}</h4>
                     </div>
                     <span className="text-white/20 text-sm font-mono">{n.date}</span>
                  </div>
                ))}
             </div>
          </section>

          <section id="promos" className="space-y-8 scroll-mt-24">
             <h3 className="text-2xl font-bold flex items-center gap-3"><span className="w-2 h-8 bg-orange-500 rounded-full" />Ưu đãi đặc biệt</h3>
             <div className="space-y-4">
                {promos.map(p => (
                   <div key={p.id} className="p-8 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 relative overflow-hidden group">
                      <div className="relative z-10">
                        <h4 className="text-xl font-bold mb-4">{p.title}</h4>
                        <div className="flex items-center gap-4">
                           <span className="px-4 py-2 bg-orange-500/20 text-orange-500 rounded-xl font-mono font-bold border border-orange-500/30">Mã: {p.code}</span>
                           <button className="text-sm font-bold text-white/40 hover:text-white transition-colors">Sao chép</button>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 p-8 text-orange-600 opacity-10 group-hover:opacity-30 transition-opacity"><Ticket className="w-20 h-20" /></div>
                   </div>
                ))}
             </div>
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-white/5 bg-zinc-950 pt-20 pb-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2">
              <Film className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold tracking-tighter text-white">CINE<span className="text-orange-500">BOOKING</span></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              CineBooking là nền tảng đặt vé xem phim trực tuyến hàng đầu, kết nối hàng triệu khán giả với những tác phẩm điện ảnh xuất sắc nhất tại các cụm rạp tiêu chuẩn quốc tế trên toàn quốc.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer group">
                  <span className="font-bold text-white/50 group-hover:text-white">f</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer group">
                  <span className="font-bold text-white/50 group-hover:text-white">y</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer group">
                  <span className="font-bold text-white/50 group-hover:text-white">i</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-widest text-xs">Khám phá</h4>
            <div className="space-y-3 text-white/40 text-sm font-medium">
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Phim đang chiếu</p>
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Phim sắp chiếu</p>
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Rạp chiếu phim</p>
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Tin tức hot</p>
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Ưu đãi hấp dẫn</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-white font-bold text-lg uppercase tracking-widest text-xs">Hỗ trợ</h4>
            <div className="space-y-3 text-white/40 text-sm font-medium">
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Trung tâm hỗ trợ</p>
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Chính sách bảo mật</p>
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Điều khoản dịch vụ</p>
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Quy chế hoạt động</p>
              <p className="hover:text-orange-500 cursor-pointer transition-colors">Liên hệ</p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div>
               <h4 className="text-white font-bold text-lg uppercase tracking-widest text-xs mb-6">Liên kết hữu ích</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer">
                     <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Số hotline</p>
                     <p className="text-sm font-bold text-orange-500">1900 1234</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer">
                     <p className="text-[10px] text-white/20 uppercase font-bold mb-1">Email</p>
                     <p className="text-sm font-bold text-white">care@cine.vn</p>
                  </div>
               </div>
            </div>
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-orange-600/10 to-transparent border border-orange-500/20">
               <h5 className="text-sm font-bold mb-3">Tải ứng dụng CineBooking</h5>
               <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[10px] font-bold text-white/60 hover:text-white transition-colors cursor-pointer border border-white/5">App Store</div>
                  <div className="flex-1 h-10 bg-white/10 rounded-xl flex items-center justify-center text-[10px] font-bold text-white/60 hover:text-white transition-colors cursor-pointer border border-white/5">Play Store</div>
               </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex flex-col gap-1">
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">&copy; 2024 CINEBOOKING VIETNAM TECHNOLOGIES JOINT STOCK COMPANY.</p>
              <p className="text-white/10 text-[9px]">Giấy CNĐKDN số 0312345678, cấp lần đầu ngày 01/01/2024 bởi Sở KHĐT TP.HCM.</p>
           </div>
           <div className="flex items-center gap-6 grayscale opacity-20">
              <img src="https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&q=80&w=100" className="h-6" alt="Icon 1" />
              <img src="https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=100" className="h-6" alt="Icon 2" />
              <img src="https://images.unsplash.com/photo-1557682224-5b8590cb9c5a?auto=format&fit=crop&q=80&w=100" className="h-6" alt="Icon 3" />
           </div>
        </div>
      </footer>

      <ChatBot />

      {selectedMovie && (
        <BookingModal 
          movie={selectedMovie} 
          user={user}
          onClose={() => setSelectedMovie(null)} 
        />
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {showHistoryModal && user && (
        <HistoryModal 
          user={user} 
          onClose={() => setShowHistoryModal(false)} 
        />
      )}

      {trailerUrl && (
        <TrailerModal 
          url={trailerUrl} 
          onClose={() => setTrailerUrl(null)} 
        />
      )}
    </div>
  );
}
