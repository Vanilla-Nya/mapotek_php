package com.vanilla.mapotek;

import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ProgressBar;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.vanilla.mapotek.adapters.ChatAdapter;
import com.vanilla.mapotek.models.ChatMessage;
import com.vanilla.mapotek.utils.GroqHelper;
import java.util.ArrayList;
import java.util.List;

public class ChatbotActivity extends AppCompatActivity {

    private RecyclerView recyclerView;
    private ChatAdapter chatAdapter;
    private List<ChatMessage> chatMessages;
    private EditText inputMessage;
    private ImageButton btnSend;
    private ProgressBar progressBar;
    private GroqHelper openAIHelper;

    // Debounce mechanism to prevent rapid requests
    private long lastRequestTime = 0;
    private static final long REQUEST_DELAY_MS = 2000; // 2 seconds between requests

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chatbot);

        // Setup toolbar
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
            getSupportActionBar().setTitle("Asisten Medis");
        }

        // Initialize views
        recyclerView = findViewById(R.id.recyclerViewChat);
        inputMessage = findViewById(R.id.inputMessage);
        btnSend = findViewById(R.id.btnSend);
        progressBar = findViewById(R.id.progressBar);

        // Initialize chat
        chatMessages = new ArrayList<>();
        chatAdapter = new ChatAdapter(chatMessages);

        LinearLayoutManager layoutManager = new LinearLayoutManager(this);
        layoutManager.setStackFromEnd(true);
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.setAdapter(chatAdapter);

        // Initialize Groq Helper
        openAIHelper = new GroqHelper(this);

        // Add welcome message
        addBotMessage("Halo! Saya asisten medis virtual. Saya dapat membantu Anda dengan informasi kesehatan umum. Apa yang ingin Anda tanyakan?");

        // Setup send button
        btnSend.setOnClickListener(v -> sendMessage());

        toolbar.setNavigationOnClickListener(v -> finish());
    }

    private void sendMessage() {
        String message = inputMessage.getText().toString().trim();

        if (message.isEmpty()) {
            Toast.makeText(this, "Silakan masukkan pesan", Toast.LENGTH_SHORT).show();
            return;
        }

        // Check if enough time has passed since last request
        long currentTime = System.currentTimeMillis();
        if (currentTime - lastRequestTime < REQUEST_DELAY_MS) {
            long waitTime = (REQUEST_DELAY_MS - (currentTime - lastRequestTime)) / 1000;
            Toast.makeText(this, "Tunggu " + waitTime + " detik sebelum mengirim pesan lagi", Toast.LENGTH_SHORT).show();
            return;
        }

        lastRequestTime = currentTime;

        // Add user message to chat
        addUserMessage(message);
        inputMessage.setText("");

        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        btnSend.setEnabled(false);

        // Send to Groq
        openAIHelper.sendMessage(message, new GroqHelper.ChatCallback() {
            @Override
            public void onSuccess(String response) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnSend.setEnabled(true);
                    addBotMessage(response);
                });
            }

            @Override
            public void onError(String error) {
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    btnSend.setEnabled(true);
                    addBotMessage("Maaf, terjadi kesalahan. Silakan coba lagi.");
                    Toast.makeText(ChatbotActivity.this, error, Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    private void addUserMessage(String message) {
        chatMessages.add(new ChatMessage(message, true));
        chatAdapter.notifyItemInserted(chatMessages.size() - 1);
        recyclerView.smoothScrollToPosition(chatMessages.size() - 1);
    }

    private void addBotMessage(String message) {
        chatMessages.add(new ChatMessage(message, false));
        chatAdapter.notifyItemInserted(chatMessages.size() - 1);
        recyclerView.smoothScrollToPosition(chatMessages.size() - 1);
    }
}