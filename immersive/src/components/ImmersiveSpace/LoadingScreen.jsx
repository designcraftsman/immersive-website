
import '../../css/LoadingScreen.css';

function LoadingScreen() {
    return(
        <div class="loading-screen">
            <div class="cube">
                <div class="sides">
                <div class="top"></div>
                <div class="right"></div>
                <div class="bottom"></div>
                <div class="left"></div>
                <div class="front"></div>
                <div class="back"></div>
                </div>
            </div>
            <div class="text">Loading Resources ...</div>
        </div>
    )
}

export default LoadingScreen;