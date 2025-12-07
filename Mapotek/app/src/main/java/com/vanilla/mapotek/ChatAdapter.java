package com.vanilla.mapotek.adapters;

import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.RecyclerView;
import com.vanilla.mapotek.R;
import com.vanilla.mapotek.models.ChatMessage;
import java.util.List;

public class ChatAdapter extends RecyclerView.Adapter<ChatAdapter.ChatViewHolder> {

    private List<ChatMessage> chatMessages;

    public ChatAdapter(List<ChatMessage> chatMessages) {
        this.chatMessages = chatMessages;
    }

    @NonNull
    @Override
    public ChatViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_chat_message, parent, false);
        return new ChatViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ChatViewHolder holder, int position) {
        ChatMessage message = chatMessages.get(position);
        holder.bind(message);
    }

    @Override
    public int getItemCount() {
        return chatMessages.size();
    }

    static class ChatViewHolder extends RecyclerView.ViewHolder {
        private TextView textMessage;
        private CardView cardMessage;
        private LinearLayout container;

        public ChatViewHolder(@NonNull View itemView) {
            super(itemView);
            textMessage = itemView.findViewById(R.id.textMessage);
            cardMessage = itemView.findViewById(R.id.cardMessage);
            container = itemView.findViewById(R.id.messageContainer);
        }

        public void bind(ChatMessage message) {
            textMessage.setText(message.getMessage());

            LinearLayout.LayoutParams params = (LinearLayout.LayoutParams) cardMessage.getLayoutParams();

            if (message.isUser()) {
                // User message - align right, blue background
                params.gravity = Gravity.END;
                cardMessage.setCardBackgroundColor(itemView.getContext().getColor(R.color.primary_color));
                textMessage.setTextColor(itemView.getContext().getColor(R.color.white));
            } else {
                // Bot message - align left, gray background
                params.gravity = Gravity.START;
                cardMessage.setCardBackgroundColor(itemView.getContext().getColor(R.color.card_background));
                textMessage.setTextColor(itemView.getContext().getColor(R.color.text_primary));
            }

            cardMessage.setLayoutParams(params);
        }
    }
}