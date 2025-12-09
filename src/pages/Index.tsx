import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface AminoAcid {
  name: string;
  nameRu: string;
  amount: number;
  idealScore: number;
  score: number;
  essential: boolean;
}

interface MealAnalysis {
  id: string;
  name: string;
  image: string;
  protein: number;
  calories: number;
  fats: number;
  carbs: number;
  timestamp: string;
  aminoAcids: AminoAcid[];
  proteinQuality: number;
  limitingAminoAcid: string;
}

const Index = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<MealAnalysis | null>(null);
  const [history, setHistory] = useState<MealAnalysis[]>([]);
  const [dailyProtein, setDailyProtein] = useState(45);
  const [proteinGoal] = useState(120);
  const [activeTab, setActiveTab] = useState('upload');

  const mockAminoAcids: AminoAcid[] = [
    { name: 'Leucine', nameRu: 'Лейцин', amount: 1890, idealScore: 1950, score: 97, essential: true },
    { name: 'Isoleucine', nameRu: 'Изолейцин', amount: 1240, idealScore: 1300, score: 95, essential: true },
    { name: 'Valine', nameRu: 'Валин', amount: 1350, idealScore: 1400, score: 96, essential: true },
    { name: 'Lysine', nameRu: 'Лизин', amount: 1680, idealScore: 1600, score: 105, essential: true },
    { name: 'Methionine', nameRu: 'Метионин', amount: 520, idealScore: 700, score: 74, essential: true },
    { name: 'Threonine', nameRu: 'Треонин', amount: 1050, idealScore: 1050, score: 100, essential: true },
    { name: 'Phenylalanine', nameRu: 'Фенилаланин', amount: 1180, idealScore: 1300, score: 91, essential: true },
    { name: 'Tryptophan', nameRu: 'Триптофан', amount: 280, idealScore: 280, score: 100, essential: true },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        analyzeMeal(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeMeal = async (image: string) => {
    setIsAnalyzing(true);
    setActiveTab('result');
    
    await new Promise(resolve => setTimeout(resolve, 2500));

    const analysis: MealAnalysis = {
      id: Date.now().toString(),
      name: 'Куриная грудка с овощами',
      image,
      protein: 42,
      calories: 385,
      fats: 12,
      carbs: 28,
      timestamp: new Date().toISOString(),
      aminoAcids: mockAminoAcids,
      proteinQuality: 87,
      limitingAminoAcid: 'Метионин'
    };

    setCurrentAnalysis(analysis);
    setHistory(prev => [analysis, ...prev]);
    setDailyProtein(prev => prev + analysis.protein);
    setIsAnalyzing(false);
    
    toast.success('Анализ завершен!', {
      description: `Найдено ${analysis.protein}г белка в блюде`
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityLabel = (quality: number) => {
    if (quality >= 90) return { text: 'Отличное', color: 'bg-green-500' };
    if (quality >= 75) return { text: 'Хорошее', color: 'bg-yellow-500' };
    return { text: 'Среднее', color: 'bg-orange-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="Dna" className="text-white" size={28} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ПротеинСкор
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Анализ белка и аминокислотного состава блюд по фото
          </p>
        </div>

        {/* Daily Progress Card */}
        <Card className="mb-8 border-2 shadow-xl animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center">
                  <Icon name="TrendingUp" className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Дневная норма белка</h3>
                  <p className="text-sm text-gray-500">Цель: {proteinGoal}г в день</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-purple-600">{dailyProtein}г</p>
                <p className="text-sm text-gray-500">{Math.round((dailyProtein / proteinGoal) * 100)}% выполнено</p>
              </div>
            </div>
            <Progress value={(dailyProtein / proteinGoal) * 100} className="h-3" />
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14 bg-white shadow-lg">
            <TabsTrigger value="upload" className="text-base">
              <Icon name="Upload" size={20} className="mr-2" />
              Загрузить
            </TabsTrigger>
            <TabsTrigger value="result" className="text-base">
              <Icon name="BarChart3" size={20} className="mr-2" />
              Анализ
            </TabsTrigger>
            <TabsTrigger value="history" className="text-base">
              <Icon name="History" size={20} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-base">
              <Icon name="User" size={20} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="border-2 border-dashed border-purple-300 bg-white/50 backdrop-blur animate-scale-in">
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse-slow">
                    <Icon name="Camera" className="text-white" size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Загрузите фото блюда</h3>
                    <p className="text-gray-600 mb-6">
                      Я мгновенно определю содержание белка и аминокислот
                    </p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <Button
                      size="lg"
                      className="gradient-primary text-white font-semibold px-8 shadow-lg hover:shadow-xl transition-all"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Icon name="Image" size={20} className="mr-2" />
                      Выбрать фото
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="font-semibold px-8 border-2"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <Icon name="Camera" size={20} className="mr-2" />
                      Сделать фото
                    </Button>
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Icon name="Zap" size={32} />
                    <div>
                      <p className="text-sm opacity-90">Проанализировано</p>
                      <p className="text-3xl font-bold">{history.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Icon name="Award" size={32} />
                    <div>
                      <p className="text-sm opacity-90">Средний скор</p>
                      <p className="text-3xl font-bold">
                        {history.length > 0 
                          ? Math.round(history.reduce((acc, h) => acc + h.proteinQuality, 0) / history.length)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Icon name="Target" size={32} />
                    <div>
                      <p className="text-sm opacity-90">До цели</p>
                      <p className="text-3xl font-bold">{proteinGoal - dailyProtein}г</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analysis Result Tab */}
          <TabsContent value="result" className="space-y-6">
            {isAnalyzing ? (
              <Card className="border-2 shadow-xl">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                    <Icon name="Loader2" className="text-white animate-spin" size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Анализирую блюдо...</h3>
                  <p className="text-gray-600">Определяю состав и аминокислотный профиль</p>
                </CardContent>
              </Card>
            ) : currentAnalysis ? (
              <div className="space-y-6 animate-fade-in">
                {/* Main Result Card */}
                <Card className="border-2 shadow-xl overflow-hidden">
                  <div className="relative h-64">
                    <img
                      src={currentAnalysis.image}
                      alt={currentAnalysis.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h2 className="text-3xl font-bold text-white mb-2">{currentAnalysis.name}</h2>
                      <div className="flex gap-2">
                        <Badge className={`${getQualityLabel(currentAnalysis.proteinQuality).color} text-white`}>
                          Качество: {getQualityLabel(currentAnalysis.proteinQuality).text}
                        </Badge>
                        <Badge variant="secondary">Скор: {currentAnalysis.proteinQuality}%</Badge>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <Icon name="Beef" className="mx-auto mb-2 text-purple-600" size={24} />
                        <p className="text-2xl font-bold text-purple-600">{currentAnalysis.protein}г</p>
                        <p className="text-sm text-gray-600">Белок</p>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-xl">
                        <Icon name="Flame" className="mx-auto mb-2 text-orange-600" size={24} />
                        <p className="text-2xl font-bold text-orange-600">{currentAnalysis.calories}</p>
                        <p className="text-sm text-gray-600">Калории</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-xl">
                        <Icon name="Droplet" className="mx-auto mb-2 text-yellow-600" size={24} />
                        <p className="text-2xl font-bold text-yellow-600">{currentAnalysis.fats}г</p>
                        <p className="text-sm text-gray-600">Жиры</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <Icon name="Cookie" className="mx-auto mb-2 text-green-600" size={24} />
                        <p className="text-2xl font-bold text-green-600">{currentAnalysis.carbs}г</p>
                        <p className="text-sm text-gray-600">Углеводы</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Amino Acids Analysis */}
                <Card className="border-2 shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-2xl flex items-center gap-2">
                          <Icon name="Dna" className="text-purple-600" size={28} />
                          Аминокислотный профиль
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                          Сравнение с идеальным скором ФАО/ВОЗ
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Лимитирующая</p>
                        <Badge variant="destructive" className="mt-1">
                          {currentAnalysis.limitingAminoAcid}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {currentAnalysis.aminoAcids.map((aa, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant={aa.essential ? "default" : "secondary"} className="min-w-[90px]">
                              {aa.essential ? 'Незаменимая' : 'Заменимая'}
                            </Badge>
                            <span className="font-semibold">{aa.nameRu}</span>
                            <span className="text-sm text-gray-500">({aa.name})</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">
                              {aa.amount}мг / {aa.idealScore}мг
                            </span>
                            <span className={`font-bold text-lg min-w-[60px] text-right ${getScoreColor(aa.score)}`}>
                              {aa.score}%
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={aa.score} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="border-2 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Icon name="Lightbulb" className="text-yellow-600" size={28} />
                      Рекомендации
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3 p-4 bg-white rounded-xl">
                      <Icon name="AlertCircle" className="text-orange-500 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-semibold mb-1">Дефицит метионина</p>
                        <p className="text-sm text-gray-600">
                          Добавьте яйца, творог или рыбу для полноценного аминокислотного профиля
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-white rounded-xl">
                      <Icon name="CheckCircle2" className="text-green-500 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-semibold mb-1">Отличный источник лизина</p>
                        <p className="text-sm text-gray-600">
                          Лизин важен для роста и восстановления тканей, иммунитета
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-4 bg-white rounded-xl">
                      <Icon name="TrendingUp" className="text-blue-500 flex-shrink-0" size={24} />
                      <div>
                        <p className="font-semibold mb-1">BCAA в норме</p>
                        <p className="text-sm text-gray-600">
                          Лейцин, изолейцин и валин поддерживают мышечный синтез
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-2 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Icon name="ImageOff" className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-xl font-semibold mb-2">Загрузите фото блюда</h3>
                  <p className="text-gray-600">Перейдите во вкладку "Загрузить" для анализа</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {history.length > 0 ? (
              history.map((meal) => (
                <Card key={meal.id} className="border-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={meal.image}
                        alt={meal.name}
                        className="w-24 h-24 object-cover rounded-xl"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{meal.name}</h3>
                            <p className="text-sm text-gray-500">
                              {new Date(meal.timestamp).toLocaleString('ru-RU')}
                            </p>
                          </div>
                          <Badge className={`${getQualityLabel(meal.proteinQuality).color} text-white`}>
                            Скор: {meal.proteinQuality}%
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Icon name="Beef" size={16} className="text-purple-600" />
                            <strong>{meal.protein}г</strong> белка
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon name="Flame" size={16} className="text-orange-600" />
                            <strong>{meal.calories}</strong> ккал
                          </span>
                          <span className="text-gray-500">
                            Лимитирующая: {meal.limitingAminoAcid}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-2 shadow-xl">
                <CardContent className="p-12 text-center">
                  <Icon name="History" className="mx-auto mb-4 text-gray-400" size={48} />
                  <h3 className="text-xl font-semibold mb-2">История пуста</h3>
                  <p className="text-gray-600">Проанализируйте первое блюдо!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="border-2 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center gap-6 mb-8">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="gradient-primary text-white text-3xl font-bold">
                      АЛ
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Александр</h2>
                    <p className="text-gray-600">Активный пользователь</p>
                    <Badge className="mt-2 gradient-primary text-white">Про-аккаунт</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-3">Цели питания</h3>
                    <div className="p-4 bg-purple-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Белок в день</span>
                        <span className="font-bold text-purple-600">{proteinGoal}г</span>
                      </div>
                      <Progress value={(dailyProtein / proteinGoal) * 100} className="h-2" />
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Калорий в день</span>
                        <span className="font-bold text-blue-600">2500 ккал</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg mb-3">Статистика</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-green-50 rounded-xl text-center">
                        <Icon name="Calendar" className="mx-auto mb-2 text-green-600" size={24} />
                        <p className="text-2xl font-bold text-green-600">7</p>
                        <p className="text-xs text-gray-600">Дней подряд</p>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-xl text-center">
                        <Icon name="Award" className="mx-auto mb-2 text-orange-600" size={24} />
                        <p className="text-2xl font-bold text-orange-600">24</p>
                        <p className="text-xs text-gray-600">Анализов</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BookOpen" size={24} className="text-purple-600" />
                  База знаний
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-left h-auto p-4">
                  <div>
                    <p className="font-semibold">Что такое аминокислотный скор?</p>
                    <p className="text-sm text-gray-600">Узнайте о качестве белка</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left h-auto p-4">
                  <div>
                    <p className="font-semibold">Незаменимые аминокислоты</p>
                    <p className="text-sm text-gray-600">Почему они важны для организма</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start text-left h-auto p-4">
                  <div>
                    <p className="font-semibold">Как комбинировать продукты</p>
                    <p className="text-sm text-gray-600">Создайте идеальный аминопрофиль</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
