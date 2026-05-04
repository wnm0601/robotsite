// script.js - Robot Software Dept Homepage & Firebase Free Board Logic

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyDmGkR7HI_7zZedsGZMVQhr74d4LcosVFI",
    authDomain: "robotre-51985.firebaseapp.com",
    projectId: "robotre-51985",
    storageBucket: "robotre-51985.firebasestorage.app",
    messagingSenderId: "945292957537",
    appId: "1:945292957537:web:39b000b09894c78d795720"
};

// --- Import Firebase Modules ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc,
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    serverTimestamp,
    where,
    arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Initialize Firebase
let db;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase initialized successfully");
} catch (e) {
    console.error("Firebase initialization failed:", e);
}

// --- DOM Elements ---
let postList, writePostBtn, postModal, postForm, viewModal, postDetail, searchInput, searchBtn;

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing components...");
    
    // Initialize DOM references
    postList = document.getElementById('postList');
    writePostBtn = document.getElementById('writePostBtn');
    postModal = document.getElementById('postModal');
    postForm = document.getElementById('postForm');
    viewModal = document.getElementById('viewModal');
    postDetail = document.getElementById('postDetail');
    searchInput = document.getElementById('searchInput');
    searchBtn = document.getElementById('searchBtn');

    if (db) {
        loadPosts();
    } else {
        renderDummyPosts();
    }
    
    setupEventListeners();
    setupClubTabs();
    setupSmoothScroll();
});

function setupSmoothScroll() {
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.onclick = function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
    });
}

function setupClubTabs() {
    const clubData = {
        "MAS": {
            title: "MAS (Micro-Autonomous System)",
            desc: "MAS는 마이크로 로봇 및 자율 주행 시스템을 연구하는 동아리입니다. 소형 센서와 임베디드 설계를 통해 정밀한 로봇 제어 기술을 습득하며, 국내외 로봇 경진대회에서 우수한 성과를 거두고 있습니다.",
            img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=500"
        },
        "MCA": {
            title: "MCA (Mobile Control & Automation)",
            desc: "MCA는 모바일 로봇과 제어 알고리즘을 전문적으로 다룹니다. 자율 주행 플랫폼을 직접 설계하고 장애물 회피, 경로 탐색 등 상용화 가능한 로봇 소프트웨어 기술을 연구하는 열정적인 팀입니다.",
            img: "mca.png"
        },
        "MoAS": {
            title: "MoAS",
            desc: "MoAS는 모빌리티 아키텍처 및 시스템을 연구하는 동아리입니다. 차세대 이동 수단의 소프트웨어 구조를 설계하고 실습하며 미래형 교통 수단의 핵심 기술을 배웁니다.",
            img: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&q=80&w=500"
        },
        "SMART": {
            title: "SMART (Smart Factory System)",
            desc: "SMART는 스마트 팩토리와 시뮬레이션 시스템을 연구합니다. 공정 자동화와 로봇 팔의 정밀 제어를 학습하며 산업 현장의 디지털 트랜스포메이션을 이끌 인재들이 모여있습니다.",
            img: "smart.png"
        },
        "UR": {
            title: "UR (Ubiquitous Robot)",
            desc: "UR은 로봇 설계, 제작, 프로그래밍을 실습하여 이론과 실무를 연결하는 동아리입니다. 팀워크를 기반으로 창의적인 로봇을 만들며, 기계 설계와 인공지능 협업 환경을 지향합니다.",
            img: "ur.png"
        },
        "지능형로봇": {
            title: "지능형로봇 (AI Robot)",
            desc: "지능형로봇 동아리는 딥러닝과 강화학습을 로봇에 적용하는 연구를 합니다. 로봇이 스스로 인지하고 판단할 수 있도록 만드는 최신 AI 기술을 실험하고 결과물을 만들어냅니다.",
            img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=500"
        }
    };

    const tabs = document.querySelectorAll('.tabs button');
    const clubTitle = document.querySelector('.club-text h4');
    const clubDesc = document.querySelector('.club-text p');
    const clubImg = document.querySelector('.club-img img');

    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const name = tab.innerText;
            if (clubData[name]) {
                clubTitle.innerText = clubData[name].title;
                clubDesc.innerText = clubData[name].desc;
                clubImg.src = clubData[name].img;
            }
        };
    });
}

function setupEventListeners() {
    // Open Write Modal
    if (writePostBtn) {
        writePostBtn.onclick = () => {
            console.log("Open write modal clicked");
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.innerText = '새 글 작성';
            if (postForm) postForm.reset();
            const postIdField = document.getElementById('postId');
            if (postIdField) postIdField.value = '';
            if (postModal) postModal.style.display = "block";
        };
    }

    // Close Modals
    const closeBtns = document.querySelectorAll('.close, .close-view, .cancel-btn');
    closeBtns.forEach(btn => {
        btn.onclick = () => {
            if (postModal) postModal.style.display = "none";
            if (viewModal) viewModal.style.display = "none";
        };
    });

    window.onclick = (event) => {
        if (event.target == postModal) postModal.style.display = "none";
        if (event.target == viewModal) viewModal.style.display = "none";
    };

    // Handle Post Submission
    if (postForm) {
        postForm.onsubmit = async (e) => {
            e.preventDefault();
            console.log("Submitting post...");
            const id = document.getElementById('postId').value;
            const data = {
                title: document.getElementById('title').value,
                author: document.getElementById('author').value,
                content: document.getElementById('content').value,
                password: document.getElementById('password').value,
                updatedAt: serverTimestamp()
            };

            try {
                if (id) {
                    await updateDoc(doc(db, "posts", id), data);
                } else {
                    data.createdAt = serverTimestamp();
                    data.comments = [];
                    await addDoc(collection(db, "posts"), data);
                }
                if (postModal) postModal.style.display = "none";
                loadPosts();
            } catch (error) {
                console.error("Save error:", error);
                alert("저장에 실패했습니다: " + error.message);
            }
        };
    }

    // Search
    if (searchBtn) searchBtn.onclick = () => performSearch();
    if (searchInput) {
        searchInput.onkeyup = (e) => { if (e.key === 'Enter') performSearch(); };
    }

    // Comment Submission
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.onsubmit = async (e) => {
            e.preventDefault();
            const viewPostId = document.getElementById('viewPostId');
            if (!viewPostId) return;
            
            const postId = viewPostId.value;
            const author = document.getElementById('commentAuthor').value;
            const text = document.getElementById('commentText').value;

            try {
                const docRef = doc(db, "posts", postId);
                await updateDoc(docRef, {
                    comments: arrayUnion({
                        author,
                        text,
                        date: new Date().toISOString()
                    })
                });
                commentForm.reset();
                viewPost(postId);
            } catch (error) {
                alert("댓글 등록 실패: " + error.message);
            }
        };
    }

    // 공유 버튼 클릭 시 링크 복사 기능
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.onclick = () => {
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                alert('링크가 클립보드에 복사되었습니다! 🎉');
            }).catch(err => {
                console.error('복사 실패:', err);
            });
        };
    }
}

// --- Board Logic ---

async function loadPosts() {
    if (!db || !postList) return;
    try {
        console.log("Loading posts from Firestore...");
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        renderPosts(querySnapshot.docs);
    } catch (error) {
        console.error("Load failed:", error);
        renderDummyPosts();
    }
}

function renderPosts(docs) {
    if (!postList) return;
    postList.innerHTML = '';
    
    if (docs.length === 0) {
        postList.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">게시물이 없습니다. 첫 글을 남겨보세요!</td></tr>';
        return;
    }

    docs.forEach((docRef, index) => {
        const post = docRef.data();
        const row = document.createElement('tr');
        const date = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '-';
        
        row.innerHTML = `
            <td>${docs.length - index}</td>
            <td class="post-title">${post.title}</td>
            <td>${post.author}</td>
            <td>${date}</td>
            <td><i class="far fa-comment"></i> ${post.comments ? post.comments.length : 0}</td>
        `;
        row.onclick = () => viewPost(docRef.id);
        postList.appendChild(row);
    });
}

function renderDummyPosts() {
    if (!postList) return;
    postList.innerHTML = `
        <tr>
            <td colspan="5" style="text-align:center; padding: 2rem;">
                <p>Firebase 연결 대기 중이거나 설정이 필요합니다.</p>
                <small>반드시 http(Live Server/Vercel) 환경에서 실행해 주세요.</small>
            </td>
        </tr>
    `;
}

async function viewPost(id) {
    try {
        const docRef = doc(db, "posts", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const post = docSnap.data();
            const date = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : '-';
            
            if (postDetail) {
                postDetail.innerHTML = `
                    <input type="hidden" id="viewPostId" value="${id}">
                    <h2>${post.title}</h2>
                    <div class="post-meta">작성자: ${post.author} | 날짜: ${date}</div>
                    <div class="post-body">${post.content}</div>
                `;
            }

            // Comments
            const commentList = document.getElementById('commentList');
            if (commentList) {
                commentList.innerHTML = '';
                if (post.comments) {
                    post.comments.forEach(c => {
                        const cDiv = document.createElement('div');
                        cDiv.className = 'comment-item';
                        cDiv.innerHTML = `
                            <div class="comment-info">${c.author} <small>${new Date(c.date).toLocaleString()}</small></div>
                            <div class="comment-text">${c.text}</div>
                        `;
                        commentList.appendChild(cDiv);
                    });
                }
            }

            // Edit / Delete Buttons
            const editBtn = document.getElementById('editBtn');
            const deleteBtn = document.getElementById('deleteBtn');
            if (editBtn) editBtn.onclick = () => openEditModal(id, post);
            if (deleteBtn) deleteBtn.onclick = () => deletePost(id, post.password);
            
            if (viewModal) viewModal.style.display = "block";
        }
    } catch (error) {
        alert("게시글 로드 실패: " + error.message);
    }
}

function openEditModal(id, post) {
    const pwd = prompt("비밀번호를 입력하세요:");
    if (pwd === post.password) {
        if (viewModal) viewModal.style.display = "none";
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) modalTitle.innerText = '글 수정';
        
        document.getElementById('postId').value = id;
        document.getElementById('title').value = post.title;
        document.getElementById('author').value = post.author;
        document.getElementById('content').value = post.content;
        document.getElementById('password').value = post.password;
        
        if (postModal) postModal.style.display = "block";
    } else if (pwd !== null) {
        alert("비밀번호가 틀렸습니다.");
    }
}

async function deletePost(id, correctPwd) {
    const pwd = prompt("정말 삭제하시겠습니까? 비밀번호를 입력하세요:");
    if (pwd === correctPwd) {
        try {
            await deleteDoc(doc(db, "posts", id));
            if (viewModal) viewModal.style.display = "none";
            loadPosts();
        } catch (error) {
            alert("삭제 실패");
        }
    } else if (pwd !== null) {
        alert("비밀번호가 틀렸습니다.");
    }
}

async function performSearch() {
    if (!searchInput) return;
    const term = searchInput.value.trim().toLowerCase();
    if (!term) {
        loadPosts();
        return;
    }

    try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const filteredDocs = querySnapshot.docs.filter(docRef => {
            const data = docRef.data();
            return data.title.toLowerCase().includes(term) || 
                   data.content.toLowerCase().includes(term) ||
                   data.author.toLowerCase().includes(term);
        });

        renderPosts({ 
            forEach: (cb) => filteredDocs.forEach(cb),
            length: filteredDocs.length
        });
    } catch (error) {
        console.error("Search failed:", error);
    }
}
