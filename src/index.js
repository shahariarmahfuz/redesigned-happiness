// ==========================================
// ১. এডমিন প্যানেল HTML (সরাসরি JSON পেস্ট করার জন্য)
// ==========================================
const ADMIN_HTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Multi-Exam Admin Panel</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; background: #f0f2f5; }
        .container { background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        h2, h3 { color: #333; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 8px; font-weight: bold; color: #555; }
        input, textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; font-family: monospace; }
        textarea { height: 200px; resize: vertical; }
        
        /* বাটন ডিজাইন */
        .btn { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; transition: 0.3s; }
        .btn-primary { background: #007bff; color: white; width: 100%; }
        .btn-primary:hover { background: #0056b3; }
        .btn-danger { background: #ff4d4d; color: white; padding: 5px 12px; font-size: 14px; }
        
        /* এক্সাম লিস্ট ডিজাইন */
        .exam-item { background: #fff; border-left: 5px solid #007bff; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .exam-info h4 { margin: 0 0 5px 0; color: #007bff; }
        .exam-info p { margin: 0; color: #666; font-size: 14px; }
        
        #message { margin-top: 15px; padding: 10px; text-align: center; display: none; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h2>MCQ অ্যাডমিন প্যানেল</h2>
        
        <div class="form-group">
            <input type="password" id="adminSecret" placeholder="প্রথমে এখানে অ্যাডমিন পাসওয়ার্ড দিন...">
        </div>

        <hr>

        <h3>নতুন এক্সাম যোগ করুন (JSON)</h3>
        <div class="form-group">
            <label>নিচে JSON পেস্ট করুন:</label>
            <textarea id="jsonInput" placeholder='{
  "title": "Example Exam",
  "start_time": "...",
  "questions": [...]
}'></textarea>
        </div>
        <button class="btn btn-primary" onclick="addExam()">এক্সাম সেভ করুন</button>
        <div id="message"></div>

        <hr>

        <h3>বর্তমান এক্সাম তালিকা</h3>
        <div id="examList">
            <p style="text-align:center;">লোড হচ্ছে...</p>
        </div>
    </div>

    <script>
        const API_URL = window.location.origin;

        // লোড হওয়ার সাথে সাথে লিস্ট দেখাবে
        window.onload = function() { fetchExams(); };

        // ১. সব এক্সাম নিয়ে আসা
        async function fetchExams() {
            try {
                const res = await fetch(API_URL + '/api/exams');
                const data = await res.json();
                const listDiv = document.getElementById('examList');
                listDiv.innerHTML = '';

                if (data.exams && data.exams.length > 0) {
                    data.exams.forEach(exam => {
                        const div = document.createElement('div');
                        div.className = 'exam-item';
                        div.innerHTML = \`
                            <div class="exam-info">
                                <h4>\${exam.title || 'Untitled Exam'}</h4>
                                <p>ID: \${exam.id}</p>
                                <p>শুরু: \${exam.start_time || 'N/A'}</p>
                                <p>মোট প্রশ্ন: \${exam.questions ? exam.questions.length : 0} টি</p>
                            </div>
                            <button class="btn btn-danger" onclick="deleteExam('\${exam.id}')">ডিলিট</button>
                        \`;
                        listDiv.appendChild(div);
                    });
                } else {
                    listDiv.innerHTML = '<p style="text-align:center;">কোনো এক্সাম নেই। নতুন যোগ করুন।</p>';
                }
            } catch (err) {
                console.error(err);
            }
        }

        // ২. নতুন এক্সাম যোগ করা
        async function addExam() {
            const secret = document.getElementById('adminSecret').value;
            const jsonText = document.getElementById('jsonInput').value;
            const msgBox = document.getElementById('message');

            if (!secret) return alert("পাসওয়ার্ড দিন!");
            if (!jsonText) return alert("JSON খালি রাখা যাবে না!");

            try {
                // JSON ভ্যালিড কি না চেক করা
                const parsedBody = JSON.parse(jsonText);

                msgBox.style.display = 'block';
                msgBox.innerText = 'সেভ হচ্ছে...';

                const res = await fetch(API_URL + '/api/add-exam', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': secret },
                    body: JSON.stringify(parsedBody)
                });

                const result = await res.json();

                if (res.ok) {
                    msgBox.className = 'success';
                    msgBox.innerText = 'সফলভাবে যোগ হয়েছে!';
                    document.getElementById('jsonInput').value = ''; // ক্লিয়ার
                    fetchExams(); // লিস্ট রিফ্রেশ
                } else {
                    msgBox.className = 'error';
                    msgBox.innerText = 'Error: ' + (result.error || 'Unknown error');
                }
            } catch (e) {
                alert("আপনার JSON ফরম্যাটে ভুল আছে! ভালো করে চেক করুন।");
            }
        }

        // ৩. এক্সাম ডিলিট করা
        async function deleteExam(id) {
            const secret = document.getElementById('adminSecret').value;
            if (!secret) return alert("ডিলিট করতে পাসওয়ার্ড লাগবে!");
            if (!confirm("আপনি কি নিশ্চিত এই এক্সামটি ডিলিট করতে চান?")) return;

            const res = await fetch(API_URL + '/api/delete-exam', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': secret },
                body: JSON.stringify({ id: id })
            });

            if (res.ok) {
                fetchExams();
            } else {
                alert("ডিলিট করা যায়নি। পাসওয়ার্ড সঠিক তো?");
            }
        }
    </script>
</body>
</html>
`;

// ==========================================
// ২. মেইন ওয়ার্কার লজিক
// ==========================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // --- ১. অ্যাডমিন পেজ সার্ভ করা ---
    if (request.method === "GET" && url.pathname === "/admin") {
      return new Response(ADMIN_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // --- ২. সব এক্সাম লিস্ট দেখা (App + Admin) ---
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/api/exams")) {
      const data = await env.MCQ_DB.get("all_exams");
      const exams = data ? JSON.parse(data) : { exams: [] };
      
      return new Response(JSON.stringify(exams), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // --- ৩. নতুন এক্সাম যোগ করা (POST) ---
    if (request.method === "POST" && url.pathname === "/api/add-exam") {
      if (request.headers.get("Authorization") !== env.ADMIN_SECRET) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
      }

      try {
        const newExam = await request.json();
        
        // অটোমেটিক ID জেনারেট করা (যদি JSON এ না থাকে)
        if (!newExam.id) {
          newExam.id = "exam_" + Date.now();
        }

        // আগের সব এক্সাম নামানো
        const existingData = await env.MCQ_DB.get("all_exams");
        let db = existingData ? JSON.parse(existingData) : { exams: [] };

        // নতুন এক্সাম লিস্টে যোগ করা
        db.exams.push(newExam);

        // সেভ করা
        await env.MCQ_DB.put("all_exams", JSON.stringify(db));

        return new Response(JSON.stringify({ status: "Success", id: newExam.id }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
      }
    }

    // --- ৪. এক্সাম ডিলিট করা (POST) ---
    if (request.method === "POST" && url.pathname === "/api/delete-exam") {
      if (request.headers.get("Authorization") !== env.ADMIN_SECRET) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
      }

      try {
        const body = await request.json();
        const deleteId = body.id;

        const existingData = await env.MCQ_DB.get("all_exams");
        let db = existingData ? JSON.parse(existingData) : { exams: [] };

        // ফিল্টার করে নির্দিষ্ট আইডি ডিলিট করা
        db.exams = db.exams.filter(exam => exam.id !== deleteId);

        await env.MCQ_DB.put("all_exams", JSON.stringify(db));

        return new Response(JSON.stringify({ status: "Deleted" }), { headers: corsHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ error: "Error deleting" }), { status: 400, headers: corsHeaders });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
