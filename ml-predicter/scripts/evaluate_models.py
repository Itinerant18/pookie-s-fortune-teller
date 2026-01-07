

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import joblib
import pandas as pd
import numpy as np
from pathlib import Path
import json
from datetime import datetime
import matplotlib.pyplot as plt
import logging

from src.config.settings import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelEvaluator:
    """Evaluate trained models and generate performance reports"""
    
    def __init__(self, model_dir: str = "./models"):
        self.model_dir = Path(model_dir)
        self.results = {}
        
    def evaluate_all(self):
        """Evaluate all trained models"""
        logger.info("=" * 60)
        logger.info("EVALUATING TRAINED MODELS")
        logger.info("=" * 60)
        
        # Check if models exist
        if not self.model_dir.exists():
            logger.error(f"Model directory not found: {self.model_dir}")
            logger.info("Run 'python scripts/train_models.py' first")
            return
        
        # Evaluate income models
        logger.info("\n[1/2] Evaluating Income Forecast Models...")
        self.evaluate_income_models()
        
        # Evaluate health models
        logger.info("\n[2/2] Evaluating Health Risk Models...")
        self.evaluate_health_models()
        
        # Generate report
        self.generate_report()
        
        logger.info("\n" + "=" * 60)
        logger.info("EVALUATION COMPLETED")
        logger.info("=" * 60)
    
    def evaluate_income_models(self):
        """Evaluate income forecasting models"""
        
        # Generate test data
        test_data = self._generate_test_data(n_samples=100)
        
        models_to_test = ['income_arima', 'income_sarima', 'income_rf']
        
        for model_name in models_to_test:
            model_path = self.model_dir / f"{model_name}.pkl"
            
            if not model_path.exists():
                logger.warning(f"✗ {model_name} not found")
                continue
            
            try:
                model = joblib.load(model_path)
                
                # Evaluate based on model type
                if 'rf' in model_name:
                    metrics = self._evaluate_rf_model(model, test_data)
                else:
                    metrics = self._evaluate_timeseries_model(model, test_data)
                
                self.results[model_name] = metrics
                
                logger.info(f"✓ {model_name}")
                logger.info(f"  MSE: {metrics['mse']:.2f}")
                logger.info(f"  RMSE: {metrics['rmse']:.2f}")
                logger.info(f"  MAPE: {metrics['mape']:.2f}%")
                
            except Exception as e:
                logger.error(f"✗ {model_name}: {e}")
    
    def evaluate_health_models(self):
        """Evaluate health prediction models"""
        
        # Generate test data
        test_data = self._generate_health_test_data(n_samples=200)
        
        # Evaluate stress classifier
        classifier_path = self.model_dir / "health_stress_classifier.pkl"
        scaler_path = self.model_dir / "health_stress_scaler.pkl"
        
        if classifier_path.exists() and scaler_path.exists():
            try:
                model = joblib.load(classifier_path)
                scaler = joblib.load(scaler_path)
                
                features = ['work_hours', 'sleep_hours', 'exercise_minutes', 
                           'mood_score', 'caffeine_cups', 'meetings_count']
                
                X_test = test_data[features].values
                y_test = test_data['risk_level'].values
                
                X_test_scaled = scaler.transform(X_test)
                
                # Predict
                y_pred = model.predict(X_test_scaled)
                
                # Calculate metrics
                from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
                
                metrics = {
                    'accuracy': accuracy_score(y_test, y_pred),
                    'precision': precision_score(y_test, y_pred, average='weighted'),
                    'recall': recall_score(y_test, y_pred, average='weighted'),
                    'f1_score': f1_score(y_test, y_pred, average='weighted')
                }
                
                self.results['health_stress_classifier'] = metrics
                
                logger.info("✓ health_stress_classifier")
                logger.info(f"  Accuracy: {metrics['accuracy']:.4f}")
                logger.info(f"  F1 Score: {metrics['f1_score']:.4f}")
                
            except Exception as e:
                logger.error(f"✗ health_stress_classifier: {e}")
        
        # Evaluate risk predictor
        predictor_path = self.model_dir / "health_risk_predictor.pkl"
        risk_scaler_path = self.model_dir / "health_risk_scaler.pkl"
        
        if predictor_path.exists() and risk_scaler_path.exists():
            try:
                model = joblib.load(predictor_path)
                scaler = joblib.load(risk_scaler_path)
                
                features = ['work_hours', 'sleep_hours', 'exercise_minutes', 
                           'mood_score', 'caffeine_cups', 'meetings_count']
                
                X_test = test_data[features].values
                y_test = test_data['stress_score'].values
                
                X_test_scaled = scaler.transform(X_test)
                
                # Predict
                y_pred = model.predict(X_test_scaled)
                
                # Calculate metrics
                from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
                
                metrics = {
                    'mse': mean_squared_error(y_test, y_pred),
                    'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
                    'mae': mean_absolute_error(y_test, y_pred),
                    'r2_score': r2_score(y_test, y_pred)
                }
                
                self.results['health_risk_predictor'] = metrics
                
                logger.info("✓ health_risk_predictor")
                logger.info(f"  RMSE: {metrics['rmse']:.2f}")
                logger.info(f"  R² Score: {metrics['r2_score']:.4f}")
                
            except Exception as e:
                logger.error(f"✗ health_risk_predictor: {e}")
    
    def _generate_test_data(self, n_samples: int = 100) -> pd.DataFrame:
        """Generate test data for income models"""
        np.random.seed(123)  # Different seed than training
        
        dates = pd.date_range(start='2024-01-01', periods=n_samples, freq='D')
        
        # Similar to training data but with different noise
        trend = np.linspace(45000, 58000, n_samples)
        seasonal = 4000 * np.sin(2 * np.pi * np.arange(n_samples) / 365)
        noise = np.random.normal(0, 2500, n_samples)
        
        income = trend + seasonal + noise
        
        df = pd.DataFrame({
            'date': dates,
            'income': income,
            'day_of_week': dates.dayofweek,
            'month': dates.month,
            'quarter': dates.quarter
        })
        
        return df
    
    def _generate_health_test_data(self, n_samples: int = 200) -> pd.DataFrame:
        """Generate test data for health models"""
        np.random.seed(123)
        
        data = {
            'work_hours': np.random.normal(8, 2, n_samples).clip(4, 14),
            'sleep_hours': np.random.normal(7, 1.5, n_samples).clip(4, 10),
            'exercise_minutes': np.random.normal(30, 20, n_samples).clip(0, 120),
            'mood_score': np.random.normal(6, 2, n_samples).clip(1, 10),
            'caffeine_cups': np.random.poisson(2, n_samples).clip(0, 8),
            'meetings_count': np.random.poisson(4, n_samples).clip(0, 15)
        }
        
        df = pd.DataFrame(data)
        
        # Calculate stress score (target)
        df['stress_score'] = (
            df['work_hours'] * 5 +
            (10 - df['sleep_hours']) * 8 +
            (60 - df['exercise_minutes']) * 0.5 +
            (10 - df['mood_score']) * 6 +
            df['caffeine_cups'] * 3 +
            df['meetings_count'] * 2
        ).clip(0, 100)
        
        # Create risk categories
        df['risk_level'] = pd.cut(
            df['stress_score'],
            bins=[0, 30, 60, 80, 100],
            labels=[0, 1, 2, 3]
        ).astype(int)
        
        return df
    
    def _evaluate_timeseries_model(self, model, test_data: pd.DataFrame) -> dict:
        """Evaluate ARIMA/SARIMA models"""
        
        # Use first 80% for fitting, last 20% for testing
        split_idx = int(len(test_data) * 0.8)
        train_values = test_data['income'].values[:split_idx]
        test_values = test_data['income'].values[split_idx:]
        
        # Forecast
        n_periods = len(test_values)
        
        try:
            forecast_result = model.get_forecast(steps=n_periods)
            predictions = forecast_result.predicted_mean
        except:
            # Model might need updating with new data
            predictions = np.full(n_periods, np.mean(train_values))
        
        # Calculate metrics
        mse = np.mean((test_values - predictions) ** 2)
        rmse = np.sqrt(mse)
        mape = np.mean(np.abs((test_values - predictions) / test_values)) * 100
        
        return {
            'mse': float(mse),
            'rmse': float(rmse),
            'mape': float(mape)
        }
    
    def _evaluate_rf_model(self, model, test_data: pd.DataFrame) -> dict:
        """Evaluate Random Forest model"""
        
        # Load scaler
        scaler = joblib.load(self.model_dir / "income_scaler.pkl")
        
        features = ['day_of_week', 'month', 'quarter']
        X_test = test_data[features].values
        y_test = test_data['income'].values
        
        X_test_scaled = scaler.transform(X_test)
        
        # Predict
        predictions = model.predict(X_test_scaled)
        
        # Calculate metrics
        from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
        
        mse = mean_squared_error(y_test, predictions)
        rmse = np.sqrt(mse)
        mape = np.mean(np.abs((y_test - predictions) / y_test)) * 100
        
        return {
            'mse': float(mse),
            'rmse': float(rmse),
            'mape': float(mape),
            'r2_score': float(r2_score(y_test, predictions))
        }
    
    def generate_report(self):
        """Generate evaluation report"""
        
        report = {
            'evaluation_date': datetime.now().isoformat(),
            'model_directory': str(self.model_dir),
            'results': self.results
        }
        
        # Save to JSON
        report_path = self.model_dir / 'evaluation_report.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"\n📊 Evaluation report saved to: {report_path}")
        
        # Print summary
        logger.info("\n" + "=" * 60)
        logger.info("EVALUATION SUMMARY")
        logger.info("=" * 60)
        
        for model_name, metrics in self.results.items():
            logger.info(f"\n{model_name}:")
            for metric, value in metrics.items():
                logger.info(f"  {metric}: {value:.4f}")
        
        # Compare income models
        self._compare_income_models()
    
    def _compare_income_models(self):
        """Compare income forecasting models"""
        
        income_models = {k: v for k, v in self.results.items() if 'income' in k}
        
        if len(income_models) < 2:
            return
        
        logger.info("\n" + "=" * 60)
        logger.info("MODEL COMPARISON")
        logger.info("=" * 60)
        
        # Find best model by RMSE
        best_model = min(income_models.items(), key=lambda x: x[1].get('rmse', float('inf')))
        
        logger.info(f"\n🏆 Best Model: {best_model[0]}")
        logger.info(f"   RMSE: {best_model[1]['rmse']:.2f}")
        logger.info(f"   MAPE: {best_model[1].get('mape', 0):.2f}%")
        
        # Comparison table
        logger.info("\n" + "-" * 60)
        logger.info(f"{'Model':<30} {'RMSE':<15} {'MAPE (%)':<15}")
        logger.info("-" * 60)
        
        for model_name, metrics in income_models.items():
            rmse = metrics.get('rmse', 0)
            mape = metrics.get('mape', 0)
            marker = "🏆" if model_name == best_model[0] else " "
            logger.info(f"{marker} {model_name:<28} {rmse:<15.2f} {mape:<15.2f}")
        
        logger.info("-" * 60)
    
    def plot_comparisons(self):
        """Generate comparison plots"""
        
        # Only plot if we have results
        if not self.results:
            return
        
        try:
            import matplotlib.pyplot as plt
            
            # Plot RMSE comparison for income models
            income_models = {k: v for k, v in self.results.items() if 'income' in k}
            
            if income_models:
                fig, ax = plt.subplots(figsize=(10, 6))
                
                models = list(income_models.keys())
                rmses = [metrics.get('rmse', 0) for metrics in income_models.values()]
                
                ax.bar(models, rmses, color='steelblue')
                ax.set_xlabel('Model')
                ax.set_ylabel('RMSE')
                ax.set_title('Income Forecast Model Comparison')
                plt.xticks(rotation=45, ha='right')
                plt.tight_layout()
                
                plot_path = self.model_dir / 'model_comparison.png'
                plt.savefig(plot_path)
                logger.info(f"\n📈 Comparison plot saved to: {plot_path}")
                
        except Exception as e:
            logger.warning(f"Could not generate plots: {e}")


def main():
    """Run model evaluation"""
    evaluator = ModelEvaluator(model_dir=settings.MODEL_PATH)
    evaluator.evaluate_all()
    evaluator.plot_comparisons()
    
    print("\n" + "=" * 60)
    print("EVALUATION COMPLETE")
    print("=" * 60)
    print(f"View full report: {settings.MODEL_PATH}/evaluation_report.json")
    print("=" * 60)


if __name__ == '__main__':
    main()