import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

  app.post("/api/recommendations", async (req, res) => {
    try {
      const { genre, mood, chatHistory } = req.body;
      let prompt = "";
      
      if (chatHistory) {
        prompt = `Bạn là trợ lý ảo CineAI. Hãy trò chuyện thân thiện và tư vấn phim dựa trên lịch sử chat này: ${JSON.stringify(chatHistory)}. Trả về câu trả lời ngắn gọn, hấp dẫn.`;
      } else {
        prompt = `Bạn là một chuyên gia tư vấn phim. Hãy gợi ý 3 bộ phim ${genre || ''} ${mood ? `phù hợp với tâm trạng ${mood}` : ''}. Trả về kết quả dưới dạng JSON array gồm các object có { "title": string, "description": string, "reason": string }.`;
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: chatHistory ? "text/plain" : "application/json",
        }
      });

      if (chatHistory) {
        res.json({ text: response.text });
      } else {
        res.json(JSON.parse(response.text || "[]"));
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to get response" });
    }
  });

  // Mock Cinema Data
  const cinemas = [
    { id: "c1", name: "CineGALAXY - Nguyễn Du", address: "116 Nguyễn Du, Quận 1" },
    { id: "c2", name: "CineSTAR - Hai Bà Trưng", address: "135 Hai Bà Trưng, Quận 3" },
    { id: "c3", name: "CineLUX - Landmark 81", address: "Binh Thanh, HCM" }
  ];

  app.get("/api/cinemas", (req, res) => {
    res.json(cinemas);
  });

  // Mock Movie Data API
  const movies = [
    {
      id: "1",
      title: "Doctor Strange: Đa Vũ Trụ Điên Loạn",
      image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/aWzlQ2N6qqg",
      rating: 8.5,
      duration: "126 phút",
      genre: "Hành động",
      description: "Doctor Strange mở ra đa vũ trụ và đối mặt với những kẻ thù mới đầy quyền năng.",
      showtimes: ["10:00", "13:30", "16:00", "19:00", "21:30"]
    },
    {
      id: "2",
      title: "Avatar: Dòng Chảy Của Nước",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
      rating: 9.0,
      duration: "192 phút",
      genre: "Khoa học viễn tưởng",
      description: "Jake Sully cùng gia đình nỗ lực bảo vệ Pandora trước sự xâm lược của loài người.",
      showtimes: ["09:00", "12:45", "16:30", "20:15"]
    },
    {
      id: "3",
      title: "John Wick: Chương 4",
      image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/qEVUtrk8_B4",
      rating: 8.8,
      duration: "169 phút",
      genre: "Hành động",
      description: "John Wick tìm cách đánh bại High Table để giành lại sự tự do cho mình.",
      showtimes: ["11:00", "14:30", "17:45", "21:00"]
    },
    {
      id: "4",
      title: "Suzume: Khóa Chặt Cửa Thần",
      image: "https://images.unsplash.com/photo-1578632738980-421719608889?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/6m6_G44M5O4",
      rating: 8.7,
      duration: "122 phút",
      genre: "Hoạt hình",
      description: "Hành trình của Suzume để ngăn chặn thảm họa giáng xuống khắp Nhật Bản.",
      showtimes: ["10:30", "13:00", "15:45", "18:15", "20:45"]
    },
    {
      id: "5",
      title: "Lật Mặt 7: Một Điều Ước",
      image: "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/mGj9z8qA6A4",
      rating: 8.9,
      duration: "115 phút",
      genre: "Tình cảm",
      description: "Câu chuyện cảm động về tình cảm gia đình và những điều ước giản đơn của người mẹ.",
      showtimes: ["08:30", "11:00", "15:30", "20:30"]
    },
    {
      id: "6",
      title: "Alien: Romulus",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/GTNMt84KT0k",
      rating: 8.5,
      duration: "119 phút",
      genre: "Kinh dị",
      description: "Một đoàn thám hiểm trẻ tuổi trên trạm vũ trụ bỏ hoang đối mặt với sinh vật đáng sợ nhất vũ trụ.",
      showtimes: ["14:00", "18:00", "21:00", "23:45"]
    },
    {
      id: "7",
      title: "Deadpool & Wolverine",
      image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/73_1biulkYk",
      rating: 9.3,
      duration: "127 phút",
      genre: "Hành động",
      description: "Deadpool bước vào MCU và phải hợp sức cùng Wolverine để ngăn chặn sự sụp đổ của đa vũ trụ.",
      showtimes: ["10:00", "13:00", "16:00", "19:00", "22:15"]
    },
    {
      id: "8",
      title: "Inside Out 2",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/LEjhY15e66w",
      rating: 8.8,
      duration: "96 phút",
      genre: "Hoạt hình",
      description: "Vùng đất tâm trí của Riley xáo trộn khi những cảm xúc mới như Lo Âu, Ganh Tị xuất hiện.",
      showtimes: ["09:30", "12:00", "15:00", "17:30", "20:00"]
    },
    {
      id: "9",
      title: "Joker: Folie à Deux",
      image: "https://images.unsplash.com/photo-1542204113-e935417614d9?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/xy8aJw1vYHo",
      rating: 7.2,
      duration: "138 phút",
      genre: "Tâm lý",
      description: "Arthur Fleck tìm thấy sự đồng điệu trong âm nhạc và tình yêu điên rồ cùng Harley Quinn tại Arkham.",
      showtimes: ["11:00", "14:30", "18:00", "21:30"]
    },
    {
      id: "10",
      title: "Dune: Part Two",
      image: "https://images.unsplash.com/photo-1510519133417-24610114b301?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/Way9Dexny3w",
      rating: 9.2,
      duration: "166 phút",
      genre: "Khoa học viễn tưởng",
      description: "Paul Atreides dẫn dắt người Fremen trong cuộc chiến giành lại Arrakis và báo thù cho gia tộc.",
      showtimes: ["10:00", "14:00", "18:00", "22:00"]
    },
    {
      id: "11",
      title: "Longlegs",
      image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/u1Sj_bCq_0s",
      rating: 7.6,
      duration: "101 phút",
      genre: "Kinh dị",
      description: "Đặc vụ FBI Lee Harker truy đuổi một kẻ sát nhân hàng loạt liên quan đến những điều huyền bí đáng sợ.",
      showtimes: ["21:45", "00:00"]
    },
    {
      id: "12",
      title: "Moana 2",
      image: "https://images.unsplash.com/photo-1520110120185-6031276332ec?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/hDZ7y8RP5HE",
      rating: 8.5,
      duration: "100 phút",
      genre: "Hoạt hình",
      description: "Moana nhận được tiếng gọi từ tổ tiên và cùng Maui bắt đầu chuyến hành trình vượt đại dương mới.",
      showtimes: ["08:45", "11:15", "13:45", "16:15", "18:45"]
    },
    {
      id: "13",
      title: "Gladiator II",
      image: "https://images.unsplash.com/photo-1599708141690-d93d2905186b?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/4rgYUipGJNo",
      rating: 8.7,
      duration: "148 phút",
      genre: "Hành động",
      description: "Nhiều năm sau cái chết của Maximus, Lucius bước vào đấu trường để bảo vệ di sản của Rome.",
      showtimes: ["10:15", "14:00", "17:45", "21:30"]
    },
    {
      id: "14",
      title: "Wicked",
      image: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/6COmYeLsz4c",
      rating: 8.9,
      duration: "160 phút",
      genre: "Âm nhạc",
      description: "Tình bạn bất ngờ giữa Elphaba và Glinda trước khi họ trở thành Phù thủy xứ Oz.",
      showtimes: ["09:45", "13:30", "17:15", "21:00"]
    },
    {
      id: "15",
      title: "Sonic the Hedgehog 3",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/qS7Zrd70qSg",
      rating: 8.6,
      duration: "110 phút",
      genre: "Hành động",
      description: "Sonic, Knuckles và Tails phải hợp sức ngăn chặn một kẻ thù mới đầy bí ẩn: Shadow.",
      showtimes: ["09:00", "12:00", "15:00", "18:00", "20:45"]
    },
    {
      id: "16",
      title: "Despicable Me 4",
      image: "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/H7C8S0A1fC8",
      rating: 8.0,
      duration: "95 phút",
      genre: "Hoạt hình",
      description: "Gru đối mặt với kẻ thù mới Maxime Le Mal trong khi cố gắng nuôi dạy cậu con trai Gru Jr.",
      showtimes: ["10:00", "12:30", "15:00", "17:30", "20:00"]
    },
    {
      id: "17",
      title: "Furiosa: A Mad Max Saga",
      image: "https://images.unsplash.com/photo-1558981403-c5f91cbba238?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/XJMuhwVlca4",
      rating: 8.4,
      duration: "148 phút",
      genre: "Hành động",
      description: "Câu chuyện khởi nguyên của Furiosa khi cô bị bắt giữ bởi đám tay chân của Warlord Dementus.",
      showtimes: ["11:30", "15:15", "19:00", "22:45"]
    },
    {
      id: "18",
      title: "Ma Da",
      image: "https://images.unsplash.com/photo-1505372404390-2e06f2334882?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/V3wW8S8h6_E",
      rating: 7.5,
      duration: "98 phút",
      genre: "Kinh dị",
      description: "Câu chuyện tâm linh rùng rợn về linh hồn oan khuất nơi sông nước miền Tây đeo bám gia đình một người thợ vớt xác.",
      showtimes: ["19:15", "21:30", "23:45"]
    },
    {
      id: "19",
      title: "Mai",
      image: "https://images.unsplash.com/photo-1512149177596-f817c7ef1d4c?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/pXpDOnK0-No",
      rating: 8.5,
      duration: "131 phút",
      genre: "Tình cảm",
      description: "Một người phụ nữ mát-xa có quá khứ nhiều tổn thương tìm thấy tình yêu chân thành bên cậu thiếu gia trẻ tuổi đào hoa.",
      showtimes: ["10:00", "14:15", "18:30", "21:45"]
    },
    {
      id: "20",
      title: "Nhà Bà Nữ",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/E5WvExhM_D4",
      rating: 8.2,
      duration: "102 phút",
      genre: "Tình cảm",
      description: "Bản hòa ca về những mâu thuẫn, khoảng cách và sự thấu hiểu trong một gia đình đa thế hệ kinh doanh món bánh canh cua.",
      showtimes: ["09:30", "12:15", "15:00", "19:30"]
    }
,
    {
      id: "21",
      title: "Twisters",
      image: "https://images.unsplash.com/photo-1527484549215-0d2931eb18e6?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/J7i_NfK16Ew",
      rating: 7.8,
      duration: "122 phút",
      genre: "Hành động",
      description: "Cặp thợ săn bão đối mặt với hiện tượng thời tiết kinh hoàng chưa từng thấy.",
      showtimes: ["11:00", "14:00", "17:00", "20:00"]
    },
    {
      id: "22",
      title: "Civil War",
      image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/c2G18q31RhE",
      rating: 8.2,
      duration: "109 phút",
      genre: "Hành động",
      description: "Hành trình nghẹt thở của các phóng viên qua một nước Mỹ đang sụp đổ.",
      showtimes: ["12:00", "15:00", "18:00", "21:00"]
    },
    {
      id: "23",
      title: "The Wild Robot",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/67beM69-bRA",
      rating: 9.0,
      duration: "102 phút",
      genre: "Hoạt hình",
      description: "Robot Roz thích nghi with sự sống hoang dã và trở thành mẹ nuôi của một chú ngỗng con.",
      showtimes: ["08:30", "10:45", "13:00", "15:15", "17:30"]
    },
    {
      id: "24",
      title: "Mufasa: The Lion King",
      image: "https://images.unsplash.com/photo-1510511459019-5dee99c4bdcc?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/o17MF9scCgg",
      rating: 8.5,
      duration: "118 phút",
      genre: "Hoạt hình",
      description: "Hành trình từ một chú sư tử mồ côi trở thành vị vua vĩ đại nhất của Mufasa.",
      showtimes: ["10:30", "13:45", "17:00", "20:15"]
    },
    {
      id: "25",
      title: "The Fall Guy",
      image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/j7jPnwVGdZ8",
      rating: 7.9,
      duration: "126 phút",
      genre: "Hành động",
      description: "Diễn viên đóng thế thực hiện nhiệm vụ giải cứu một ngôi sao mất tích ngoài đời thực.",
      showtimes: ["12:30", "15:45", "19:00", "22:15"]
    },
    {
      id: "26",
      title: "Kung Fu Panda 4",
      image: "https://images.unsplash.com/photo-1582126892902-18da9e062973?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/S_IPh6YpExY",
      rating: 8.2,
      duration: "94 phút",
      genre: "Hoạt hình",
      description: "Po tìm kiếm người kế vị Thần Long Đại Hiệp mới trong khi đối mặt với Tắc Kè Hoa.",
      showtimes: ["09:15", "11:45", "14:15", "16:45", "19:15"]
    },
    {
      id: "27",
      title: "Godzilla x Kong: The New Empire",
      image: "https://images.unsplash.com/photo-1590179068383-b9c69aacebd3?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/qqrpMRDuPfc",
      rating: 8.6,
      duration: "115 phút",
      genre: "Hành động",
      description: "Phép cộng sức mạnh của Godzilla và Kong chống lại một kẻ thù từ rỗng tâm trái đất.",
      showtimes: ["14:30", "17:45", "21:00"]
    },
    {
      id: "28",
      title: "Talk to Me",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/aLAKJu9aUXA",
      rating: 7.8,
      duration: "95 phút",
      genre: "Kinh dị",
      description: "Trò chơi gọi hồn bằng bàn tay ma thuật mang lại những hậu quả chết người.",
      showtimes: ["21:00", "23:00", "01:00"]
    },
    {
      id: "29",
      title: "Past Lives",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/kA244xewM98",
      rating: 9.1,
      duration: "106 phút",
      genre: "Tình cảm",
      description: "Cuộc hội ngộ của hai người bạn thơ ấu và những suy ngẫm về định mệnh đời người.",
      showtimes: ["11:30", "15:00", "18:30"]
    },
    {
      id: "30",
      title: "Spider-Man: Across the Spider-Verse",
      image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/shW9i6k8cB0",
      rating: 9.4,
      duration: "140 phút",
      genre: "Hoạt hình",
      description: "Miles Morales du hành qua đa vũ trụ nhện và gặp gỡ đội quân Người Nhện hùng hậu.",
      showtimes: ["09:00", "12:15", "15:30", "18:45"]
    },
    {
      id: "31",
      title: "Oppenheimer",
      image: "https://images.unsplash.com/photo-1475274047050-130c09f30294?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/uYPbbksJxIg",
      rating: 9.1,
      duration: "180 phút",
      genre: "Tâm lý",
      description: "Dự án Manhattan và sự ra đời của bom nguyên tử dưới góc nhìn của J. Robert Oppenheimer.",
      showtimes: ["13:00", "17:00", "21:00"]
    },
    {
      id: "32",
      title: "Barbie",
      image: "https://images.unsplash.com/photo-1485093451681-d1c9257e96e5?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/pBk4NYhWNMM",
      rating: 8.0,
      duration: "114 phút",
      genre: "Tình cảm",
      description: "Barbie dấn thân vào thế giới thực để tìm kiếm ý nghĩa của sự tồn tại.",
      showtimes: ["10:00", "13:00", "16:00", "19:00"]
    },
    {
      id: "33",
      title: "Speak No Evil",
      image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/5mTo3U6-0H0",
      rating: 7.4,
      duration: "110 phút",
      genre: "Kinh dị",
      description: "Một chuyến thăm cuối tuần biến thành thảm kịch kinh hoàng đầy bất ngờ.",
      showtimes: ["18:45", "21:15", "23:30"]
    },
    {
      id: "34",
      title: "Nosferatu",
      image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/6i8CHZ_i7vM",
      rating: 8.8,
      duration: "132 phút",
      genre: "Kinh dị",
      description: "Bản chuyển thể ám ảnh về huyền thoại ma cà rồng cổ điển Nosferatu.",
      showtimes: ["20:30", "22:45", "01:00"]
    },
    {
      id: "35",
      title: "Cám",
      image: "https://images.unsplash.com/photo-1543185377-99cd19911181?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/pD_lA5H22b4",
      rating: 7.3,
      duration: "105 phút",
      genre: "Kinh dị",
      description: "Dị bản kinh dị đầy ám ảnh của truyện cổ tích Tấm Cám, khám phá những góc tối nấp sau một truyền thuyết nổi tiếng.",
      showtimes: ["15:00", "18:00", "21:00"]
    },
    {
      id: "36",
      title: "Transformers: One",
      image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/V-H_U9yT8W0",
      rating: 8.4,
      duration: "104 phút",
      genre: "Hoạt hình",
      description: "Câu chuyện khởi đầu về tình bạn giữa Orion Pax và D-16 tại Cybertron.",
      showtimes: ["09:00", "11:30", "14:00", "16:30", "19:00"]
    },
    {
      id: "37",
      title: "The Substance",
      image: "https://images.unsplash.com/photo-1512149177596-f817c7ef1d4c?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/K81jZ9Yp2_8",
      rating: 8.1,
      duration: "140 phút",
      genre: "Kinh dị",
      description: "Một nữ minh tinh sử dụng chất cấm để duy trì sự trẻ đẹp và nhận lại hậu quả thảm khốc.",
      showtimes: ["21:30", "23:45"]
    },
    {
      id: "38",
      title: "Bố Già",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/jZ_yN6M2X1M",
      rating: 8.4,
      duration: "128 phút",
      genre: "Tâm lý",
      description: "Câu chuyện về xóm lao động nghèo và tình cha con đầy xúc động.",
      showtimes: ["10:00", "14:00", "18:00", "21:30"]
    },
    {
      id: "39",
      title: "Your Name",
      image: "https://images.unsplash.com/photo-1578632738980-421719608889?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/Noo6bFkyz9A",
      rating: 9.5,
      duration: "106 phút",
      genre: "Hoạt hình",
      description: "Hai thiếu niên xa lạ bắt đầu hoán đổi cơ thể cho nhau một cách kỳ bí.",
      showtimes: ["09:00", "13:00", "17:00", "20:30"]
    },
    {
      id: "40",
      title: "Interstellar",
      image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/zSWdZVtXT7E",
      rating: 9.6,
      duration: "169 phút",
      genre: "Khoa học viễn tưởng",
      description: "Chuyến du hành xuyên hố đen để tìm kiếm hành tinh mới cho nhân loại.",
      showtimes: ["11:00", "15:00", "19:00", "22:30"]
    },
    {
      id: "41",
      title: "Puss in Boots: The Last Wish",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/RqrXhwS33Ic",
      rating: 9.3,
      duration: "102 phút",
      genre: "Hoạt hình",
      description: "Chú Mèo Đi Hanh dấn thân vào chuyến phiêu lưu cuối cùng để tìm lại 9 mạng sống của mình.",
      showtimes: ["08:30", "10:45", "13:00", "15:15"]
    },
    {
      id: "42",
      title: "Top Gun: Maverick",
      image: "https://images.unsplash.com/photo-1510519133417-24610114b301?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/giXco2jaZ_4",
      rating: 9.2,
      duration: "131 phút",
      genre: "Hành động",
      description: "Maverick trở lại trường đua Top Gun để huấn luyện một thế hệ phi công mới cho nhiệm vụ nguy hiểm.",
      showtimes: ["14:00", "17:00", "20:00"]
    },
    {
      id: "43",
      title: "Everything Everywhere All At Once",
      image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/wxN1T1uxQ2g",
      rating: 9.0,
      duration: "139 phút",
      genre: "Hành động",
      description: "Một người phụ nữ nhập cư Trung Quốc bị cuốn vào một cuộc phiêu lưu điên rồ xuyên đa vũ trụ.",
      showtimes: ["11:30", "15:00", "18:30", "21:45"]
    },
    {
      id: "44",
      title: "Spirited Away",
      image: "https://images.unsplash.com/photo-1578632738980-421719608889?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/ByXuk9QqQkk",
      rating: 9.7,
      duration: "125 phút",
      genre: "Hoạt hình",
      description: "Chihiro lạc vào thế giới linh hồn và phải tìm cách giải cứu cha mẹ mình khỏi lời nguyền.",
      showtimes: ["09:00", "12:00", "15:00", "18:00"]
    },
    {
      id: "45",
      title: "The Conjuring 4",
      image: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      rating: 7.9,
      duration: "110 phút",
      genre: "Kinh dị",
      description: "Vợ chồng nhà Warren đối mặt với vụ án tâm linh kinh hoàng cuối cùng trong sự nghiệp.",
      showtimes: ["20:00", "22:30", "01:00"]
    },
    {
      id: "46",
      title: "Guardians of the Galaxy Vol 3",
      image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/u3V5nFgGTOY",
      rating: 9.1,
      duration: "150 phút",
      genre: "Hành động",
      description: "Đội Vệ binh Dải ngân hà cùng nhau thực hiện nhiệm vụ cuối cùng để bảo vệ Rocket.",
      showtimes: ["10:00", "13:30", "17:00", "20:30"]
    },
    {
      id: "47",
      title: "Soul",
      image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/GsPq9puYwfY",
      rating: 8.9,
      duration: "100 phút",
      genre: "Hoạt hình",
      description: "Một giáo viên âm nhạc tìm lại ý nghĩa thực sự của cuộc sống sau một tai nạn bất ngờ.",
      showtimes: ["09:00", "11:15", "13:30", "16:00"]
    },
    {
      id: "48",
      title: "Parasite",
      image: "https://images.unsplash.com/photo-1542204113-e935417614d9?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/5xH0HfJHsaY",
      rating: 9.4,
      duration: "132 phút",
      genre: "Tâm lý",
      description: "Sự cộng sinh kỳ lạ giữa hai gia đình thuộc hai tầng lớp khác nhau tại Hàn Quốc.",
      showtimes: ["14:00", "17:30", "21:00"]
    },
    {
      id: "49",
      title: "Inception",
      image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/YoHD9XEInc0",
      rating: 9.5,
      duration: "148 phút",
      genre: "Khoa học viễn tưởng",
      description: "Một kẻ đánh cắp giấc mơ phải thâm nhập vào tâm trí để gieo rắc một ý tưởng.",
      showtimes: ["11:00", "14:45", "18:30", "22:15"]
    },
    {
      id: "50",
      title: "The Batman",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/mqqft2x_Aa4",
      rating: 8.7,
      duration: "176 phút",
      genre: "Hành động",
      description: "Bruce Wayne trong năm thứ hai làm thám tử tại Gotham chống lại kẻ giết người Ridder.",
      showtimes: ["10:00", "14:00", "18:00", "22:00"]
    },
    {
      id: "51",
      title: "Lật Mặt 6: Tấm Vé Định Mệnh",
      image: "https://images.unsplash.com/photo-1478720131746-8693cc54497e?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/S_IPh6YpExY",
      rating: 8.8,
      duration: "132 phút",
      genre: "Hành động",
      description: "Nhóm bạn thân lâu năm bị cuốn vào vòng xoáy của lòng tham và nghi kỵ sau khi sở hữu tấm vé số trúng giải độc đắc hàng tỷ đồng.",
      showtimes: ["11:00", "14:30", "18:30", "21:00"]
    },
    {
      id: "52",
      title: "Hai Phượng",
      image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
      trailer: "https://www.youtube.com/embed/E5WvExhM_D4",
      rating: 8.4,
      duration: "98 phút",
      genre: "Hành động",
      description: "Một nữ cao thủ giấu mình trong bóng đêm phải lộ diện, bắt đầu hành trình đơn độc tìm lại đứa con bị bắt cóc bởi băng đảng buôn người.",
      showtimes: ["13:00", "16:00", "19:00", "22:00"]
    }
  ];

  app.get("/api/movies", (req, res) => {
    res.json(movies);
  });

  // Mock Bookings
  const bookings: any[] = [];
  app.post("/api/bookings", (req, res) => {
    const booking = { 
      ...req.body, 
      id: `CB-${Math.floor(Math.random() * 100000)}`, 
      createdAt: new Date() 
    };
    bookings.push(booking);
    res.json(booking);
  });

  app.get("/api/bookings/seats", (req, res) => {
    const { movieTitle, date, time } = req.query;
    const bookedSeats = bookings
      .filter(b => b.movieTitle === movieTitle && b.date === date && b.time === time)
      .flatMap(b => b.seats);
    res.json(bookedSeats);
  });

  app.get("/api/bookings/:userId", (req, res) => {
    const userBookings = bookings.filter(b => b.userId === req.params.userId);
    res.json(userBookings);
  });

  // Mock News & Promotions
  const news = [
    { id: "n1", title: "Bom tấn Marvel sắp quay trở lại", category: "Điện ảnh", date: "18/05" },
    { id: "n2", title: "Top 5 phim kinh dị đáng xem nhất 2026", category: "Gợi ý", date: "17/05" },
    { id: "n3", title: "Sự kiện thảm đỏ Avatar 3", category: "Sự kiện", date: "16/05" }
  ];

  const promotions = [
    { id: "p1", title: "Thứ Hai Vui Vẻ - Đồng giá 45k", code: "HAPPYMON" },
    { id: "p2", title: "Học sinh sinh viên giảm 20%", code: "STUDENT" },
    { id: "p3", title: "Mua 2 vé tặng 1 bắp", code: "POPCORN" }
  ];

  app.get("/api/news", (req, res) => res.json(news));
  app.get("/api/promotions", (req, res) => res.json(promotions));

  // Mock Users & Auth
  const users: any[] = [];
  app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body;
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: "Email đã tồn tại" });
    }
    const newUser = { id: Date.now().toString(), email, password, name };
    users.push(newUser);
    res.json({ id: newUser.id, email: newUser.email, name: newUser.name });
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: "Email hoặc mật khẩu không đúng" });
    }
    res.json({ id: user.id, email: user.email, name: user.name });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production (Vercel or Container)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      // Use original path for static serving
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only listen if this file is run directly (not as a module on Vercel)
  if (process.env.VERCEL) {
    console.log("Running on Vercel - Exporting app instead of listening");
  } else {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  }

  return app;
}

// Khởi chạy server ngay lập tức cho môi trường AI Studio
const appPromise = startServer();

// Export mặc định cho Vercel (nếu cần triển khai dưới dạng Serverless Function)
export default async (req: any, res: any) => {
  const app = await appPromise;
  return app(req, res);
};
