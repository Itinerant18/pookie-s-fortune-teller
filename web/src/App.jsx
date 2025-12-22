import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { predictionService } from './services/api' // NEW IMPORT
import './App.css' // NEW IMPORT

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [predictions, setPredictions] = useState([]) // NEW STATE

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // NEW useEffect for loading predictions when session is available
  useEffect(() => {
    if (session) {
      loadPredictions()
    }
  }, [session])

  const loadPredictions = async () => { // NEW FUNCTION
    try {
      // Assuming predictionService.getAll() can filter by user or handles authentication internally
      const result = await predictionService.getAll() 
      if (result.success) {
        setPredictions(result.data)
      }
    } catch (error) {
      console.error("Error loading predictions:", error)
    }
  }

  const handleGenerate = async () => { // NEW FUNCTION
    try {
      await predictionService.generate('career', '6_months')
      loadPredictions() // Reload predictions after generating a new one
    } catch (error) {
      console.error("Error generating prediction:", error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="container" style={{ padding: '50px' }}>
      <h1>Hybrid Prediction App</h1>
      {!session ? (
        <Auth />
      ) : (
        <Dashboard key={session.user.id} session={session} />
      )}
    </div>
  )
}

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">Sign In</button>
      </form>
    </div>
  )
}


function Dashboard({ session }) {
  const [predictions, setPredictions] = useState([])

  useEffect(() => {
    getPredictions()
    
    // Real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'predictions',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Realtime update:', payload)
          getPredictions()
        }
      )
      .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
  }, [session])

  async function getPredictions() {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      if (data) setPredictions(data)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleGeneratePrediction = async () => {
    try {
      await predictionService.generate('career', '6_months')
      // Real-time subscription will update the list
    } catch (error) {
      console.error("Error generating prediction:", error)
      alert("Failed to generate prediction")
    }
  }

  return (
    <div>
      <h2>Welcome, {session.user.email}</h2>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => supabase.auth.signOut()} style={{ marginRight: '10px' }}>Sign Out</button>
        <button onClick={handleGeneratePrediction}>Generate Career Prediction</button>
      </div>
      
      <h3>Your Predictions</h3>
      {predictions.length === 0 ? (
        <p>No predictions yet.</p>
      ) : (
        <ul>
          {predictions.map(pred => (
            <li key={pred.id}>
              <strong>{pred.category}</strong> ({pred.timeframe}): {pred.combined_prediction?.recommendation || 'Processing...'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
