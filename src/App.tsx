import Scanner from './components/Scanner';
import './App.css';

// Main App Component - Harsh Truth Scanner
function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Background pattern */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2 tracking-tight">
            🧾 HARSH TRUTH SCANNER
          </h1>
          <p className="text-gray-600 text-sm font-mono">
            Quét sự thật về những thứ bạn nói hoài mà chưa làm
          </p>
        </header>

        {/* Scanner Component */}
        <Scanner />

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-400 text-xs font-mono">
          <p>© 2025 Reality Check Division</p>
          <p className="mt-1">"Sự thật thì đau, nhưng cần thiết."</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
