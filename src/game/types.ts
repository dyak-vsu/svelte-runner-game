export interface GameApi {
    start: () => void;
    stop: () => void;
    jump: () => void;
    shoot: () => void;
    restart: () => void;
}