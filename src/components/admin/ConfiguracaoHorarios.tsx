import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import professionalService from "@/services/professionalService";
import type { WorkingHour } from "@/services/professionalService";
import { Copy, Sun, Moon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ConfiguracaoHorariosProps {
  professional: any;
  onUpdate: () => void;
}

const defaultWorkingHours: WorkingHour[] = [
  { dayOfWeek: 1, isAvailable: true, timeSlots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { dayOfWeek: 2, isAvailable: true, timeSlots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { dayOfWeek: 3, isAvailable: true, timeSlots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { dayOfWeek: 4, isAvailable: true, timeSlots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { dayOfWeek: 5, isAvailable: true, timeSlots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
  { dayOfWeek: 6, isAvailable: false, timeSlots: [] },
  { dayOfWeek: 0, isAvailable: false, timeSlots: [] },
];

export function ConfiguracaoHorarios({ professional, onUpdate }: ConfiguracaoHorariosProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(
    professional?.workingHours?.map((day: WorkingHour) => ({
      ...day,
      timeSlots: day.isAvailable ? (day.timeSlots?.length > 0 ? day.timeSlots : [
        { start: "09:00", end: "12:00" },
        { start: "14:00", end: "18:00" }
      ]) : []
    })) || defaultWorkingHours
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getDayName = (dayOfWeek: number): string => {
    const days = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];
    return days[dayOfWeek];
  };

  const handleDayToggle = (dayOfWeek: number) => {
    setWorkingHours(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return {
          ...day,
          isAvailable: !day.isAvailable,
          timeSlots: !day.isAvailable ? [
            { start: "09:00", end: "12:00" },
            { start: "14:00", end: "18:00" }
          ] : []
        };
      }
      return day;
    }));
  };

  const handleTimeChange = (dayOfWeek: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setWorkingHours(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const timeSlots = [...day.timeSlots];
        timeSlots[slotIndex] = {
          ...timeSlots[slotIndex],
          [field]: value
        };
        return { ...day, timeSlots };
      }
      return day;
    }));
  };

  const handleCopyToOtherDays = (sourceDayOfWeek: number) => {
    const sourceDay = workingHours.find(day => day.dayOfWeek === sourceDayOfWeek);
    if (!sourceDay) return;

    setWorkingHours(prev => prev.map(day => {
      // Não copiar para domingos e sábados por padrão
      if (day.dayOfWeek === sourceDayOfWeek || day.dayOfWeek === 0 || day.dayOfWeek === 6) {
        return day;
      }
      return {
        ...day,
        isAvailable: sourceDay.isAvailable,
        timeSlots: [...sourceDay.timeSlots.map(slot => ({ ...slot }))]
      };
    }));

    toast({
      title: "Horários copiados",
      description: "Os horários foram copiados para os outros dias da semana.",
    });
  };

  const handlePeriodToggle = (dayOfWeek: number, period: 'morning' | 'afternoon') => {
    setWorkingHours(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const timeSlots = [...day.timeSlots];
        const periodIndex = period === 'morning' ? 0 : 1;
        
        // Se o período estava ativo, remova-o
        if (timeSlots[periodIndex]) {
          timeSlots.splice(periodIndex, 1);
        } else {
          // Se o período estava inativo, adicione-o
          const newSlot = period === 'morning' 
            ? { start: "09:00", end: "12:00" }
            : { start: "14:00", end: "18:00" };
          
          timeSlots.splice(periodIndex, 0, newSlot);
        }

        // Se não há mais períodos ativos, desative o dia
        const isAvailable = timeSlots.length > 0;
        
        return {
          ...day,
          isAvailable,
          timeSlots
        };
      }
      return day;
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await professionalService.update(professional.id, {
        ...professional,
        workingHours
      });
      
      toast({
        title: "Horários atualizados",
        description: "Seus horários foram atualizados com sucesso.",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar horários:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar seus horários. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Horários</CardTitle>
        <CardDescription>Configure seus horários de trabalho para cada dia da semana</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {workingHours.map((day) => (
            <div key={day.dayOfWeek} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={day.isAvailable}
                    onChange={() => handleDayToggle(day.dayOfWeek)}
                    className="rounded border-gray-300"
                  />
                  <span className="font-medium">{getDayName(day.dayOfWeek)}</span>
                  
                  {day.isAvailable && (
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`morning-${day.dayOfWeek}`}
                          checked={Boolean(day.timeSlots[0])}
                          onChange={() => handlePeriodToggle(day.dayOfWeek, 'morning')}
                          className="rounded border-gray-300"
                        />
                        <Label 
                          htmlFor={`morning-${day.dayOfWeek}`}
                          className="flex items-center gap-1 text-sm cursor-pointer"
                        >
                          <Sun className="w-4 h-4" />
                          <span>Manhã</span>
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`afternoon-${day.dayOfWeek}`}
                          checked={Boolean(day.timeSlots[1])}
                          onChange={() => handlePeriodToggle(day.dayOfWeek, 'afternoon')}
                          className="rounded border-gray-300"
                        />
                        <Label 
                          htmlFor={`afternoon-${day.dayOfWeek}`}
                          className="flex items-center gap-1 text-sm cursor-pointer"
                        >
                          <Moon className="w-4 h-4" />
                          <span>Tarde</span>
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                {day.dayOfWeek === 1 && day.isAvailable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyToOtherDays(day.dayOfWeek)}
                    className="flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar para outros dias</span>
                  </Button>
                )}
              </div>

              {day.isAvailable && day.timeSlots.map((slot, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {index === 0 ? "Horário da Manhã" : "Horário da Tarde"}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="time"
                        value={slot.start}
                        onChange={(e) => handleTimeChange(day.dayOfWeek, index, 'start', e.target.value)}
                      />
                      <span>até</span>
                      <Input
                        type="time"
                        value={slot.end}
                        onChange={(e) => handleTimeChange(day.dayOfWeek, index, 'end', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}

          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
