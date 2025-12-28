// ==========================================
// কনফিগারেশন এবং এডমিন HTML
// ==========================================

const ADMIN_HTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MCQ Admin Panel</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f4f4f9; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h2 { color: #333; text-align: center; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        .question-box { background: #f9f9f9; border: 1px solid #eee; padding: 15px; margin-bottom: 15px; border-radius: 5px; position: relative; }
        .btn { padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .btn-primary { background: #007bff; color: white; width: 100%; }
        .btn-secondary { background: #6c757d; color: white; margin-top: 10px; }
        .btn-danger { background: #dc3545; color: white; position: absolute; top: 10px; right: 10px; padding: 5px 10px; font-size: 12px; }
        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        #message { margin-top: 15px; padding: 10px; text-align: center; display: none; border-radius: 4px; }
        .success { background: #d4edda; color: #155724; }
        .error { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="container">
        <h2>MCQ এক্সাম সেটআপ</h2>
        
        <div class="form-group">
            <label>অ্যাডমিন সিক্রেট (পাসওয়ার্ড)</label>
            <input type="password" id="adminSecret" placeholder="wrangler.toml এর পাসওয়ার্ডটি দিন">
        </div>

        <hr>

        <div class="form-group">
            <label>এক্সাম টাইটেল</label>
            <input type="text" id="examTitle" placeholder="যেমন: সাধারণ জ্ঞান - পর্ব ১">
        </div>
        
        <div class="options-grid">
            <div class="form-group">
                <label>শুরুর সময়</label>
                <input type="datetime-local" id="startTime">
            </div>
            <div class="form-group">
                <label>শেষ হওয়ার সময়</label>
                <input type="datetime-local" id="endTime">
            </div>
        </div>

        <div id="questionsList">
            </div>

        <button type="button" class="btn btn-secondary" onclick="addQuestionField()">+ নতুন প্রশ্ন যোগ করুন</button>
        <br><br>
        <button type="button" class="btn btn-primary" onclick="submitExam()">সেভ ও পাবলিশ করুন</button>
        
        <div id="message"></div>
    </div>

    <script>
        // শুরুতে একটি প্রশ্ন ফিল্ড যোগ করা
        window.onload = function() { addQuestionField(); };

        function addQuestionField() {
            const container = document.getElementById('questionsList');
            const qIndex = container.children.length + 1;
            
            const div = document.createElement('div');
            div.className = 'question-box';
            div.innerHTML = \`
                <button class="btn btn-danger" onclick="this.parentElement.remove()">ডিলিট</button>
                <div class="form-group">
                    <label>প্রশ্ন \${qIndex}</label>
                    <input type="text" class="q-text" placeholder="প্রশ্নটি লিখুন...">
                </div>
                <label>অপশন সমূহ:</label>
                <div class="options-grid">
                    <input type="text" class="q-opt" placeholder="অপশন ১">
                    <input type="text" class="q-opt" placeholder="অপশন ২">
                    <input type="text" class="q-opt" placeholder="অপশন ৩">
                    <input type="text" class="q-opt" placeholder="অপশন ৪">
                </div>
                <div class="form-group" style="margin-top:10px;">
                    <label>সঠিক উত্তর (হুবহু অপশনের মতো হতে হবে)</label>
                    <input type="text" class="q-ans" placeholder="সঠিক উত্তরটি লিখুন">
                </div>
            \`;
            container.appendChild(div);
        }

        async function submitExam() {
            const secret = document.getElementById('adminSecret').value;
            const msgBox = document.getElementById('message');
            
            if(!secret) {
                alert("দয়া করে অ্যাডমিন পাসওয়ার্ড দিন!");
                return;
            }

            // ডাটা সংগ্রহ
            const examInfo = {
                title: document.getElementById('examTitle').value,
                start_time: document.getElementById('startTime').value,
                end_time: document.getElementById('endTime').value,
                status: "active"
            };

            const questions = [];
            document.querySelectorAll('.question-box').forEach(box => {
                const qText = box.querySelector('.q-text').value;
                const options = Array.from(box.querySelectorAll('.q-opt')).map(i => i.value);
                const ans = box.querySelector('.q-ans').value;

                if(qText && ans) {
                    questions.push({
                        question: qText,
                        options: options,
                        answer: ans
                    });
                }
            });

            const payload = { exam_info: examInfo, questions: questions };

            msgBox.style.display = 'block';
            msgBox.innerText = 'অপেক্ষা করুন...';
            msgBox.className = '';

            try {
                const response = await fetch('/update-exam', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': secret
                    },
                    body: JSON.stringify(payload)
                });

                if(response.ok) {
                    msgBox.innerText = 'সফলভাবে সেভ করা হয়েছে!';
                    msgBox.className = 'success';
                } else {
                    msgBox.innerText = 'ভুল পাসওয়ার্ড অথবা সার্ভার সমস্যা!';
                    msgBox.className = 'error';
                }
            } catch (error) {
                msgBox.innerText = 'নেটওয়ার্ক এরর!';
                msgBox.className = 'error';
            }
        }
    </script>
</body>
</html>
`;

// ==========================================
// মেইন ওয়ার্কার লজিক
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

    // ----------------------------------------------------
    // ১. অ্যাডমিন প্যানেল দেখানোর জন্য রুট (/admin)
    // ----------------------------------------------------
    if (request.method === "GET" && url.pathname === "/admin") {
      return new Response(ADMIN_HTML, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // ----------------------------------------------------
    // ২. অ্যাপ বা ওয়েবসাইট ডাটা পাওয়ার জন্য (GET Request)
    // ----------------------------------------------------
    if (request.method === "GET" && url.pathname === "/") {
      const data = await env.MCQ_DB.get("current_exam");
      
      if (!data) {
        return new Response(JSON.stringify({ 
          message: "No exam scheduled currently.",
          exam_info: null 
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(data, {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // ----------------------------------------------------
    // ৩. ডাটা আপডেট করার API (POST Request)
    // ----------------------------------------------------
    if (request.method === "POST" && url.pathname === "/update-exam") {
      const secret = request.headers.get("Authorization");
      
      // এখানে পাসওয়ার্ড চেক হচ্ছে
      if (secret !== env.ADMIN_SECRET) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { 
          status: 403, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        });
      }

      try {
        const body = await request.json();
        await env.MCQ_DB.put("current_exam", JSON.stringify(body));

        return new Response(JSON.stringify({ 
          status: "Success", 
          message: "Exam updated!" 
        }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: corsHeaders });
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders });
  },
};
