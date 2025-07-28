import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { ChevronDown, ChevronUp, Book, Link, CheckCircle, Edit2, Clock } from 'lucide-react';

// --- Firebase Configuration ---
// This has been updated with your project details.
// IMPORTANT: You may need to add the `messagingSenderId` and `appId` from your Firebase Console.
const firebaseConfig = {
    apiKey: "AIzaSyBX4oBvEH6-0vL0Y_IjSyBXy6KY2aIRwgc",
    authDomain: "gate-tracker-a89ac.firebaseapp.com",
    projectId: "gate-tracker-a89ac",
    storageBucket: "gate-tracker-a89ac.appspot.com",
    messagingSenderId: "1033160813933", // This is your Project Number, often used as sender ID.
    appId: "YOUR_WEB_APP_ID" // Find this in your Firebase Project Settings -> General -> Your apps
};
const appId = 'gate-tracker-app'; // You can keep this or change it

// --- Initial Syllabus Data ---
const initialSyllabus = [
    {
      id: 'ga',
      name: 'General Aptitude (GA)',
      weightage: '15 Marks',
      isOpen: true,
      topics: [
        { id: 'ga1', name: 'Verbal Aptitude', status: 'Not Started', revisions: [false, false, false] },
        { id: 'ga2', name: 'Quantitative Aptitude', status: 'Not Started', revisions: [false, false, false] },
        { id: 'ga3', name: 'Analytical Aptitude', status: 'Not Started', revisions: [false, false, false] },
        { id: 'ga4', name: 'Spatial Aptitude', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'math',
      name: 'Engineering Mathematics',
      weightage: 'Approx. 13 Marks',
      isOpen: true,
      topics: [
        { id: 'math1', name: 'Discrete Mathematics', status: 'Not Started', revisions: [false, false, false] },
        { id: 'math2', name: 'Linear Algebra', status: 'Not Started', revisions: [false, false, false] },
        { id: 'math3', name: 'Calculus', status: 'Not Started', revisions: [false, false, false] },
        { id: 'math4', name: 'Probability and Statistics', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'dl',
      name: 'Digital Logic (DL)',
      weightage: 'Approx. 3-5 Marks',
      isOpen: false,
      topics: [
        { id: 'dl1', name: 'Boolean Algebra', status: 'Not Started', revisions: [false, false, false] },
        { id: 'dl2', name: 'Combinational Circuits', status: 'Not Started', revisions: [false, false, false] },
        { id: 'dl3', name: 'Sequential Circuits', status: 'Not Started', revisions: [false, false, false] },
        { id: 'dl4', name: 'Number Representations & Computer Arithmetic', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'coa',
      name: 'Computer Organization and Architecture (COA)',
      weightage: 'Approx. 8-10 Marks',
      isOpen: false,
      topics: [
        { id: 'coa1', name: 'Machine Instructions & Addressing Modes', status: 'Not Started', revisions: [false, false, false] },
        { id: 'coa2', name: 'ALU, Data-path and Control Unit', status: 'Not Started', revisions: [false, false, false] },
        { id: 'coa3', name: 'Instruction Pipelining & Hazards', status: 'Not Started', revisions: [false, false, false] },
        { id: 'coa4', name: 'Memory Hierarchy (Cache, Main, Secondary)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'coa5', name: 'I/O Interface (Interrupt, DMA)', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'pds',
      name: 'Programming and Data Structures (PDS)',
      weightage: 'Approx. 10-12 Marks',
      isOpen: false,
      topics: [
        { id: 'pds1', name: 'Programming in C', status: 'Not Started', revisions: [false, false, false] },
        { id: 'pds2', name: 'Arrays, Stacks, Queues', status: 'Not Started', revisions: [false, false, false] },
        { id: 'pds3', name: 'Linked Lists', status: 'Not Started', revisions: [false, false, false] },
        { id: 'pds4', name: 'Trees (BST, AVL)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'pds5', name: 'Binary Heaps', status: 'Not Started', revisions: [false, false, false] },
        { id: 'pds6', name: 'Graphs', status: 'Not Started', revisions: [false, false, false] },
        { id: 'pds7', name: 'Hashing', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'algo',
      name: 'Algorithms',
      weightage: 'Approx. 7-9 Marks',
      isOpen: false,
      topics: [
        { id: 'algo1', name: 'Analysis & Asymptotic Notation', status: 'Not Started', revisions: [false, false, false] },
        { id: 'algo2', name: 'Divide and Conquer', status: 'Not Started', revisions: [false, false, false] },
        { id: 'algo3', name: 'Greedy Algorithms', status: 'Not Started', revisions: [false, false, false] },
        { id: 'algo4', name: 'Dynamic Programming', status: 'Not Started', revisions: [false, false, false] },
        { id: 'algo5', name: 'Graph Traversal & Shortest Paths', status: 'Not Started', revisions: [false, false, false] },
        { id: 'algo6', name: 'Minimum Spanning Trees', status: 'Not Started', revisions: [false, false, false] },
        { id: 'algo7', name: 'NP-Completeness', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'toc',
      name: 'Theory of Computation (TOC)',
      weightage: 'Approx. 8-10 Marks',
      isOpen: false,
      topics: [
        { id: 'toc1', name: 'Regular Expressions & Finite Automata', status: 'Not Started', revisions: [false, false, false] },
        { id: 'toc2', name: 'Context-Free Grammars & Push-Down Automata', status: 'Not Started', revisions: [false, false, false] },
        { id: 'toc3', name: 'Regular and Context-Free Languages, Pumping Lemma', status: 'Not Started', revisions: [false, false, false] },
        { id: 'toc4', name: 'Turing Machines and Undecidability', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'cd',
      name: 'Compiler Design (CD)',
      weightage: 'Approx. 4-6 Marks',
      isOpen: false,
      topics: [
        { id: 'cd1', name: 'Lexical Analysis', status: 'Not Started', revisions: [false, false, false] },
        { id: 'cd2', name: 'Parsing (LL, LR, LALR)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'cd3', name: 'Syntax Directed Translation', status: 'Not Started', revisions: [false, false, false] },
        { id: 'cd4', name: 'Intermediate Code Generation', status: 'Not Started', revisions: [false, false, false] },
        { id: 'cd5', name: 'Code Optimization', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'os',
      name: 'Operating Systems (OS)',
      weightage: 'Approx. 8-10 Marks',
      isOpen: false,
      topics: [
        { id: 'os1', name: 'Processes, Threads, System Calls', status: 'Not Started', revisions: [false, false, false] },
        { id: 'os2', name: 'CPU Scheduling Algorithms', status: 'Not Started', revisions: [false, false, false] },
        { id: 'os3', name: 'Process Synchronization (Semaphores, Mutexes)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'os4', name: 'Deadlocks', status: 'Not Started', revisions: [false, false, false] },
        { id: 'os5', name: 'Memory Management (Paging, Virtual Memory)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'os6', name: 'File Systems', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'dbms',
      name: 'Database Management Systems (DBMS)',
      weightage: 'Approx. 7-9 Marks',
      isOpen: false,
      topics: [
        { id: 'dbms1', name: 'ER-Model & Relational Model', status: 'Not Started', revisions: [false, false, false] },
        { id: 'dbms2', name: 'SQL', status: 'Not Started', revisions: [false, false, false] },
        { id: 'dbms3', name: 'Normalization (1NF, 2NF, 3NF, BCNF)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'dbms4', name: 'File Organization & Indexing (B/B+ Trees)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'dbms5', name: 'Transactions & Concurrency Control', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
    {
      id: 'cn',
      name: 'Computer Networks (CN)',
      weightage: 'Approx. 8-10 Marks',
      isOpen: false,
      topics: [
        { id: 'cn1', name: 'Layering Concepts (OSI, TCP/IP)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'cn2', name: 'Data Link Layer (Framing, MAC)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'cn3', name: 'Network Layer (IP, Routing)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'cn4', name: 'Transport Layer (TCP, UDP, Congestion Control)', status: 'Not Started', revisions: [false, false, false] },
        { id: 'cn5', name: 'Application Layer (DNS, HTTP, SMTP)', status: 'Not Started', revisions: [false, false, false] },
      ],
    },
];

// --- Helper Components ---
const ProgressBar = ({ value }) => (
  <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 shadow-inner">
    <div
      className="bg-indigo-600 h-4 rounded-full transition-all duration-500 ease-out"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

// --- Main App Component ---
export default function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [syllabus, setSyllabus] = useState(initialSyllabus);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- Firebase Initialization and Auth ---
  useEffect(() => {
    try {
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);
        setAuth(authInstance);
        setDb(dbInstance);

        onAuthStateChanged(authInstance, async (user) => {
            if (user) {
            setUserId(user.uid);
            } else {
                await signInAnonymously(authInstance);
            }
        });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        setIsLoading(false);
    }
  }, []);

  // --- Data Fetching from Firestore ---
  useEffect(() => {
    if (userId && db) {
      const docRef = doc(db, 'artifacts', appId, 'users', userId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.syllabus && Array.isArray(data.syllabus)) {
             setSyllabus(data.syllabus);
          } else {
             setSyllabus(initialSyllabus);
          }
        } else {
          setDoc(docRef, { syllabus: initialSyllabus });
        }
        setIsLoading(false);
      }, (error) => {
          console.error("Firestore snapshot error:", error);
          setIsLoading(false);
      });

      return () => unsubscribe();
    } else if (!db) {
        setIsLoading(false);
    }
  }, [userId, db]);

  // --- Data Saving Logic ---
  const saveData = useCallback(async (newSyllabus) => {
    if (userId && db) {
      setIsSaving(true);
      try {
        const docRef = doc(db, 'artifacts', appId, 'users', userId);
        await setDoc(docRef, { syllabus: newSyllabus });
      } catch (error) {
        console.error("Error saving data:", error);
      } finally {
        setTimeout(() => setIsSaving(false), 500);
      }
    }
  }, [userId, db]);

  // --- Event Handlers ---
  const handleTopicUpdate = (subjectId, topicId, field, value) => {
    const newSyllabus = syllabus.map(subject => {
      if (subject.id === subjectId) {
        const updatedTopics = subject.topics.map(topic => {
          if (topic.id === topicId) {
            return { ...topic, [field]: value };
          }
          return topic;
        });
        return { ...subject, topics: updatedTopics };
      }
      return subject;
    });
    setSyllabus(newSyllabus);
    saveData(newSyllabus);
  };

  const handleRevisionToggle = (subjectId, topicId, revisionIndex) => {
    const newSyllabus = syllabus.map(subject => {
      if (subject.id === subjectId) {
        const updatedTopics = subject.topics.map(topic => {
          if (topic.id === topicId) {
            const newRevisions = [...topic.revisions];
            newRevisions[revisionIndex] = !newRevisions[revisionIndex];
            return { ...topic, revisions: newRevisions };
          }
          return topic;
        });
        return { ...subject, topics: updatedTopics };
      }
      return subject;
    });
    setSyllabus(newSyllabus);
    saveData(newSyllabus);
  };

  const toggleSubject = (subjectId) => {
    const newSyllabus = syllabus.map(subject => {
      if (subject.id === subjectId) {
        return { ...subject, isOpen: !subject.isOpen };
      }
      return subject;
    });
    setSyllabus(newSyllabus);
    saveData(newSyllabus);
  };
  
  // --- Progress Calculation ---
  const totalTopics = syllabus.reduce((acc, subject) => acc + subject.topics.length, 0);
  const completedTopics = syllabus.reduce((acc, subject) => acc + subject.topics.filter(t => t.status === 'Done').length, 0);
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg text-gray-600">Loading your personalized tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GATE CSE 2026 Prep Tracker</h1>
              <p className="mt-1 text-gray-600">Your interactive checklist to conquer the syllabus.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
               {isSaving && <span className="text-sm text-gray-500 animate-pulse">Saving...</span>}
               {userId && <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">User ID: {userId.substring(0, 10)}...</div>}
            </div>
          </div>
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-700">Overall Progress</h3>
              <span className="text-xl font-bold text-indigo-600">{progressPercentage}%</span>
            </div>
            <ProgressBar value={progressPercentage} />
          </div>
        </div>

        {/* --- Syllabus Table --- */}
        <div className="space-y-4">
          {syllabus.map(subject => (
            <div key={subject.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Subject Header */}
              <div
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSubject(subject.id)}
              >
                <div className="flex items-center space-x-4">
                  <Book className="w-6 h-6 text-indigo-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{subject.name}</h2>
                    <p className="text-sm text-gray-500">{subject.weightage}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="hidden sm:inline-block text-sm font-medium text-gray-600">{subject.topics.filter(t => t.status === 'Done').length} / {subject.topics.length} topics done</span>
                    {subject.isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </div>
              </div>

              {/* Topics List (Collapsible) */}
              {subject.isOpen && (
                <div className="bg-gray-50/50">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Topic</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Revisions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {subject.topics.map(topic => (
                          <tr key={topic.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{topic.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={topic.status}
                                onChange={(e) => handleTopicUpdate(subject.id, topic.id, 'status', e.target.value)}
                                className="block w-36 pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                              >
                                <option>Not Started</option>
                                <option>In Progress</option>
                                <option>Done</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-3">
                                {[...Array(3)].map((_, i) => (
                                  <div key={i} className="flex flex-col items-center">
                                      <label htmlFor={`rev-${topic.id}-${i}`} className="sr-only">Revision {i+1}</label>
                                      <input
                                        id={`rev-${topic.id}-${i}`}
                                        type="checkbox"
                                        checked={topic.revisions[i]}
                                        onChange={() => handleRevisionToggle(subject.id, topic.id, i)}
                                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                      />
                                      <span className="text-xs text-gray-500 mt-1">R{i + 1}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <footer className="text-center mt-12 pb-4">
            <p className="text-sm text-gray-500">Made with ❤️ by Kartikey Maurya</p>
            <p className="text-xs text-gray-400 mt-2">Built to help me succeed. Good luck!</p>
        </footer>
      </div>
    </div>
  );
}